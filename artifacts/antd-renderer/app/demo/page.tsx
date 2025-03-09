"use client";

import React from "react";
import styled from "styled-components";
import { Form, Input, Button, Divider, Typography } from "antd";

const { Text, Link } = Typography;

const PageContainer = styled.div`
  display: flex;
  width: 1440px;
  height: 900px;
  padding: 24px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: var(--colorBgLayout, #f5f5f5);
`;

const FormContainer = styled.div`
  display: flex;
  width: 420px;
  padding: 48px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  border-radius: 8px;
  border: 1px solid var(--colorSplit, rgba(0, 0, 0, 0.06));
  background: var(--colorBgContainer, #fff);
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

const EmailForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const SignInPage: React.FC = () => {
  return (
    <PageContainer>
      <FormContainer>
        <div>
          {/* Logo Component */}
          <img src="/path/to/logo.png" alt="Finexus Logo" />
        </div>
        <TitleContainer>
          <h4>Sign in to Finexus</h4>
          <Text type="secondary">
            Not your device? Use a private or incognito window to sign in.
          </Text>
        </TitleContainer>
        <EmailForm>
          <Form.Item label="Email / Phone Number" style={{ marginBottom: 0 }}>
            <Input />
          </Form.Item>
          <Button type="primary" size="large" block>
            Next
          </Button>
        </EmailForm>
        <Divider>or</Divider>
        <ButtonContainer>
          <Button
            icon={<img src="/path/to/google-icon.png" alt="Google" />}
            block
            size="large"
          >
            Continue with Google
          </Button>
          <Button
            icon={<img src="/path/to/apple-icon.png" alt="Apple" />}
            block
          >
            Continue with Apple
          </Button>
        </ButtonContainer>
        <Button type="link" block>
          New user? Create an account
        </Button>
      </FormContainer>
      <FooterContainer>
        <Text type="secondary">
          © 2019 - 2022 antforfigma.com. All rights reserved
        </Text>
        <Link>Privacy Policy</Link>
      </FooterContainer>
    </PageContainer>
  );
};

export default SignInPage;
