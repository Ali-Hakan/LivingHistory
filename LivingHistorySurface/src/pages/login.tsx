import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Card, Checkbox, Divider, Form, Input, Layout, message } from "antd";
import { CloseCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { memo } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import styles from "../styles/login.module.css";

interface LoginValues {
    username: string;
    password: string;
    remember: boolean;
}

const API_URL = `${process.env.BACKEND_IP}/api/login`;

async function loginRequest(values: LoginValues) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();
    return data;
}

const Login: React.FC = () => {
    const router = useRouter();
    const { value } = router.query;
    const { Content } = Layout;
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = useCallback(async (values: LoginValues) => {
        setLoading(true);
        try {
            const data = await loginRequest(values);
            if (data.success) {
                localStorage.setItem("token", data.token);
                if (values.remember) {
                    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    document.cookie = `authToken=${data.token}; expires=${expirationDate.toUTCString()}; path=/`;
                } else {
                    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                }
                router.push("/home");
            } else {
                messageApi.error({
                    key: "signup",
                    content: "The provided credentials do not appear to be accurate.",
                    duration: 2
                });
            }
        } catch (e) {
            messageApi.error({
                key: "signup",
                content: "Unfortunately, an issue has arisen.",
                duration: 2
            });
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        const authToken = document.cookie
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("authToken="));

        if (authToken) {
            const token = authToken.split("=")[1];
            localStorage.setItem("token", token);
            router.push("/home");
        }
    }, [router]);

    return (
        <Layout className={styles["layout"]}>
            {contextHolder}
            <Header />
            <Content className={styles["content"]}>
                <Card>
                    <Form
                        className={styles["form"]}
                        name="login"
                        onFinish={onFinish}
                        initialValues={{ remember: !!document.cookie.includes("authToken=") }}
                    >
                        <Form.Item
                            name="username"
                            initialValue={value}
                            rules={[{ required: true, message: "Please enter your username." }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Username"
                                allowClear={{ clearIcon: <CloseCircleOutlined className={styles["icon"]} /> }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "Please enter your password." }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                type="password"
                                placeholder="Password"
                                allowClear={{ clearIcon: <CloseCircleOutlined className={styles["icon"]} /> }}
                            />
                        </Form.Item>
                        <Form.Item name="remember" valuePropName="checked">
                            <Checkbox>{"Remember me"}</Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                className={styles["form__item__button"]}
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                {"Log In"}
                            </Button>
                        </Form.Item>
                        <Divider plain={true}>{"New to Living History?"}</Divider>
                        <Form.Item className={styles["form__item"]}>
                            <Link href="/signup">
                                <Button className={styles["link__button"]} type="default" htmlType="submit" block>
                                    {"Create your account"}
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