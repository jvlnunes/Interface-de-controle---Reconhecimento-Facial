import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import EmployeeList from './EmployeeList';
import EmployeeForm from './Employeeform';
import Dashboard from './Dashboard';
import AccessLogs from './pages/AccessLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AccessLogs />} />
          <Route path="/funcionarios" element={<EmployeeList />} />
          <Route path="/funcionarios/novo" element={<EmployeeForm />} />
          <Route path="/funcionarios/:id" element={<EmployeeForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}