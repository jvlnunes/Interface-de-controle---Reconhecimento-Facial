import json
import boto3
import uuid
import os
import decimal
from datetime import datetime, timezone


class DecimalEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


dynamodb = boto3.resource("dynamodb")
NOME_TABELA = os.environ.get("DYNAMO_TABLE_FUNCIONARIOS", "Funcionarios")
tabela = dynamodb.Table(NOME_TABELA)


def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    }

    try:
        http_method = event.get("httpMethod") or event.get("requestContext", {}).get(
            "http", {}
        ).get("method")

        if http_method == "OPTIONS":
            return {"statusCode": 200, "headers": headers, "body": ""}

        path_parameters = event.get("pathParameters") or {}
        id_funcionario = path_parameters.get("id")

        if http_method == "GET":
            if id_funcionario:
                response = tabela.get_item(Key={"id_funcionarios": id_funcionario})
                item = response.get("Item")
                if not item:
                    return {
                        "statusCode": 404,
                        "headers": headers,
                        "body": json.dumps({"message": "Funcionário não encontrado"}),
                    }
                item["id"] = item.pop("id_funcionarios")
                return {
                    "statusCode": 200,
                    "headers": headers,
                    "body": json.dumps(item, cls=DecimalEncoder),
                }
            else:
                response = tabela.scan()
                items = response.get("Items", [])
                for item in items:
                    item["id"] = item.pop("id_funcionarios")

                return {
                    "statusCode": 200,
                    "headers": headers,
                    "body": json.dumps(items, cls=DecimalEncoder),
                }

        elif http_method == "POST":
            body = json.loads(event.get("body", "{}"))
            novo_id = str(uuid.uuid4())
            novo_item = {
                "id_funcionarios": novo_id,
                "fullName": body.get("fullName", ""),
                "doors": body.get("doors", []),
                "faceCount": 0,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
            tabela.put_item(Item=novo_item)
            novo_item["id"] = novo_item.pop("id_funcionarios")
            return {
                "statusCode": 201,
                "headers": headers,
                "body": json.dumps(novo_item, cls=DecimalEncoder),
            }

        elif http_method == "PUT":
            if not id_funcionario:
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"message": "ID ausente"}),
                }
            body = json.loads(event.get("body", "{}"))
            response = tabela.update_item(
                Key={"id_funcionarios": id_funcionario},
                UpdateExpression="SET fullName = :fn, doors = :d, updatedAt = :u",
                ExpressionAttributeValues={
                    ":fn": body.get("fullName", ""),
                    ":d": body.get("doors", []),
                    ":u": datetime.now(timezone.utc).isoformat(),
                },
                ReturnValues="ALL_NEW",
            )
            item_atualizado = response.get("Attributes", {})
            item_atualizado["id"] = item_atualizado.pop("id_funcionarios")
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(item_atualizado, cls=DecimalEncoder),
            }

        elif http_method == "DELETE":
            if not id_funcionario:
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"message": "ID ausente"}),
                }
            tabela.delete_item(Key={"id_funcionarios": id_funcionario})
            return {"statusCode": 204, "headers": headers, "body": ""}

        return {
            "statusCode": 405,
            "headers": headers,
            "body": json.dumps({"message": "Método não permitido"}),
        }

    except Exception as e:
        print(f"Erro: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)}),
        }
