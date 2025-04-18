import React from 'react';
import { Layout, Typography } from 'antd';
import { PackageProvider } from './context/PackageContext';
import PackageTable from './components/PackageTable';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <PackageProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: '16px 0' }}>
            Package Version Checker
          </Title>
        </Header>
        <Content style={{ padding: '24px' }}>
          <PackageTable />
        </Content>
      </Layout>
    </PackageProvider>
  );
}

export default App; 