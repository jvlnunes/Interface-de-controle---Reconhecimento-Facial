import json
import datetime
import os
import boto3
import urllib.request
import base64
import uuid

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

NOME_TABELA_LOGS = os.environ.get('DYNAMO_TABLE_LOGS', 'LogsAcesso')
NOME_TABELA_FUNC = os.environ.get('DYNAMO_TABLE_FUNCIONARIOS', 'Funcionarios')
NOME_BUCKET_S3 = os.environ.get('S3_BUCKET_FOTOS', 'bucket-fotos-acesso')

tabela_logs = dynamodb.Table(NOME_TABELA_LOGS)
tabela_funcionarios = dynamodb.Table(NOME_TABELA_FUNC)

def lambda_handler(event, context):
    try:
        QDRANT_URL = os.environ.get('QDRANT_URL', '').rstrip('/')
        QDRANT_API_KEY = os.environ.get('QDRANT_API_KEY', '')
        
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
            
        vetor = body.get('vetor')
        porta = body.get('porta', 'Porta Desconhecida')  
        foto_base64 = body.get('foto_base64')
        
        if not vetor or len(vetor) != 512:
            return {"statusCode": 400, "body": json.dumps({"erro": "Vetor inválido. Esperado 512 dimensões."})}
            
        timestamp_oficial = datetime.datetime.now(datetime.timezone.utc).isoformat()
        registro_id = str(uuid.uuid4())
        
        # 1. Salva a Foto no Amazon S3 
        url_foto_s3 = "Sem foto"
        if foto_base64:
            try:
                foto_bytes = base64.b64decode(foto_base64)
                nome_arquivo_s3 = f"tentativas/{timestamp_oficial}_{registro_id}.jpg"
                s3.put_object(Bucket=NOME_BUCKET_S3, Key=nome_arquivo_s3, Body=foto_bytes, ContentType='image/jpeg')
                url_foto_s3 = f"https://{NOME_BUCKET_S3}.s3.amazonaws.com/{nome_arquivo_s3}"
            except Exception as e:
                print(f"Erro S3: {e}")

        # 2. Busca Vetorial no Qdrant
        url_busca = f"{QDRANT_URL}/collections/identidades_rostos/points/search"
        payload_qdrant = json.dumps({"vector": vetor, "limit": 1, "with_payload": True}).encode('utf-8')
        headers = {"Content-Type": "application/json", "Api-Key": QDRANT_API_KEY}
        
        try:
            req = urllib.request.Request(url_busca, data=payload_qdrant, headers=headers, method='POST')
            with urllib.request.urlopen(req) as response:
                qdrant_response = json.loads(response.read().decode('utf-8'))
            resultados = qdrant_response.get('result', [])
        except Exception:
            resultados = []
        
        # 3. Avaliação de Acesso com Cruzamento de Dados
        status_acesso = "Acesso Negado - Rosto Desconhecido"
        status_code = 403
        nome_funcionario = "Desconhecido"
        id_funcionario = "Desconhecido"
        score = 0.0

        if resultados and resultados[0]['score'] > 0.60:
            melhor_match = resultados[0]
            score = melhor_match['score']
            # Pega o ID do funcionário que o Qdrant identificou
            id_funcionario = str(melhor_match.get('payload', {}).get('id_funcionario', melhor_match['id']))
            
            try:
                # Vai na tabela de Funcionários ver quem é essa pessoa e se ela tem acesso
                resposta_bd = tabela_funcionarios.get_item(Key={'id_funcionarios': id_funcionario})
                funcionario_db = resposta_bd.get('Item')
                
                if funcionario_db:
                    nome_funcionario = funcionario_db.get('fullName', 'Sem Nome')
                    portas_permitidas = funcionario_db.get('doors', [])
                
                    if porta in portas_permitidas:
                        status_acesso = "Acesso Liberado"
                        status_code = 200
                    else:
                        status_acesso = f"Acesso Negado - Sem permissão para {porta}"
                        status_code = 403
                else:
                    status_acesso = "Acesso Negado - Cadastro removido do RH"
            except Exception as e:
                print(f"Erro ao buscar funcionário no Dynamo: {e}")
                status_acesso = "Acesso Negado - Erro de validação"
            
        # 4. Registra no DynamoDB o Log Completo
        tabela_logs.put_item(
            Item={
                'id_registro': registro_id,            
                'timestamp': timestamp_oficial,        
                'porta': porta,                        
                'status': status_acesso,               
                'id_funcionario': id_funcionario,      
                'score_reconhecimento': str(score),    
                'link_foto': url_foto_s3               
            }
        )
        
        return {
            "statusCode": status_code,
            "body": json.dumps({
                "mensagem": status_acesso,
                "nome_funcionario": nome_funcionario,
                "porta": porta,
                "horario": timestamp_oficial
            })
        }
            
    except Exception as e:
        print(f"Erro Crítico: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"erro": str(e)})}