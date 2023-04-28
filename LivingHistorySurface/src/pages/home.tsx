import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Row, Col, Menu, Typography } from "antd";
import { HighlightOutlined, HomeOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styles from "../styles/home.module.css";
import Image from "next/image";

type MenuItem = Required<MenuProps>["items"][number];

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const getItem = ({
    label,
    key,
    icon,
    children,
    type,
}: {
    label: React.ReactNode;
    key: React.Key;
    icon?: React.ReactNode;
    children?: MenuItem[];
    type?: "group";
}): MenuItem => ({
    key,
    icon,
    children,
    label,
    type,
});

const items: MenuItem[] = [getItem({ label: "Create Memory", key: "1", icon: <HighlightOutlined /> })];

const Home: React.FunctionComponent = () => {
    const breadcrumbTitle = (
        <Col className={styles["breadcrumb-col"]}>
            <HomeOutlined />
            <Text>{"Home"}</Text>
        </Col>
    );

    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    const [openKeys, setOpenKeys] = useState<string[]>(["1"]);

    return (
        <Layout className={styles["layout"]}>
            <Header className={styles["header"]}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Image
                            src={"/images/gothicha.png"}
                            alt={"Gothicha"}
                            width={500}
                            height={500}
                            quality={100}
                            loading="eager"
                            priority
                        />
                    </Col>
                </Row>
            </Header>
            <Content className={styles["content"]}>
                <Breadcrumb className={styles["breadcrumb"]} items={[{ href: "/home", title: breadcrumbTitle }]} />
                <Layout>
                    <Sider>
                        <Menu mode="inline" selectedKeys={selectedKeys} openKeys={openKeys} onSelect={({ key }) => setSelectedKeys([key as string])} onOpenChange={setOpenKeys} items={items} />
                    </Sider>
                    <Content className={styles["inside-content"]}>

                    </Content>
                </Layout>
            </Content>
        </Layout>
    );
};

export default Home;