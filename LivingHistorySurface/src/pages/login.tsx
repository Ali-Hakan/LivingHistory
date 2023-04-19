import styles from "../styles/login.module.css";
import { Button, Card, Checkbox, Divider, Form, Input, Layout } from "antd";
import { CloseCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import _Item from "@/components/_item";

const Login: React.FC = () => {
    const { Content } = Layout;
    return (
        <Layout
            className={styles["layout"]}>
            <Header/>
            <Content
                className={styles["content"]}>
                <Card>
                    <Form
                        name="login"
                        className={styles["form"]}
                        initialValues={{ remember: true }}>
                        <_Item
                            name="username"
                            rules={[{ required: true, message: "Your username is what we desire." }]}>
                            <Input
                                prefix={<UserOutlined className="site-form-item-icon" />}
                                placeholder="Username"
                                allowClear={{ clearIcon: <CloseCircleOutlined className={styles["form-input-icon"]} /> }}>
                            </Input>
                        </_Item>
                        <_Item
                            name="password"
                            rules={[{ required: true, message: "Share your secret with us." }]}>
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                                allowClear={{ clearIcon: <CloseCircleOutlined className={styles["form-input-icon"]} /> }}>
                            </Input.Password>
                        </_Item>
                        <_Item>
                            <_Item
                                name="remember"
                                valuePropName="checked"
                                noStyle>
                                <Checkbox>
                                    {"Remember me"}
                                </Checkbox>
                            </_Item>
                        </_Item>
                        <_Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles["form-button-login"]}
                                block>
                                {"Log in"}
                            </Button>
                        </_Item>
                        <Divider
                            plain>
                            {"New to Living History?"}
                        </Divider>
                        <_Item
                            className={styles["form-item"]}>
                            <Link href={"/signup"}>
                                <Button
                                    type="default"
                                    htmlType="submit"
                                    className={styles["form-button-signup"]}
                                    block>
                                    {"Create your account!"}
                                </Button>
                            </Link>
                        </_Item>
                    </Form>
                </Card>
            </Content>
            <Footer/>
        </Layout>
    );
};

export default Login;