import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Card, Checkbox, Divider, Form, Input, Layout, message } from "antd";
import { CloseCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { memo } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import styles from "../styles/login.module.css";

interface LoginValues {
    username: string;
    password: string;
    remember: boolean;
}

const Login: React.FC = () => {
    const router = useRouter();
    const { Content } = Layout;
    const { value } = router.query;
    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = useCallback(async (values: LoginValues) => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem("token", data.token);
                router.push("/home");
            } else {
                messageApi.error({
                    key: "signup",
                    content: "Thy username or secret is a lie.",
                    duration: 2
                });
            }
        } catch (e) {
            messageApi.error({
                key: "signup",
                content: "O Alas! Something hath gone awry.",
                duration: 2
            });
        }
        setLoading(false);
    }, [router]);

    return (
        <Layout className={styles["layout"]}>
            {contextHolder}
            <Header />
            <Content className={styles["content"]}>
                <Card>
                    <Form
                        name="login"
                        className={styles["form"]}
                        onFinish={onFinish}
                        initialValues={{ remember: true }}>
                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: "Thy username is what we doth desire." },
                            ]}
                            initialValue={value ?? ""}>
                            <Input
                                prefix={<UserOutlined className="site-form-item-icon" />}
                                placeholder="Username"
                                allowClear={{ clearIcon: <CloseCircleOutlined className={styles["form-input-icon"]} /> }} />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "Unveil thy secret unto us." }]}>
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                                allowClear={{ clearIcon: <CloseCircleOutlined className={styles["form-input-icon"]} /> }} />
                        </Form.Item>
                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>{"Remember me!"}</Checkbox>
                            </Form.Item>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles["form-button-login"]}
                                block
                                loading={loading}>
                                {"Log in"}
                            </Button>
                        </Form.Item>
                        <Divider plain>{"New to Living History?"}</Divider>
                        <Form.Item className={styles["form-item"]}>
                            <Link href={"/signup"}>
                                <Button
                                    type="default"
                                    htmlType="submit"
                                    className={styles["form-button-signup"]}
                                    block>
                                    {"Create your account!"}
                                </Button>
                            </Link>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
            <Footer />
        </Layout>
    );
};

export default memo(Login);