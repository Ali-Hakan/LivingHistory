import styles from "../styles/components.module.css";
import { Layout } from "antd";

const Header: React.FC = () => {
    const { Footer } = Layout;
    return (
        <Footer
            className={styles["footer"]}>
            {"© 2023-2023, LivingHistory.com, hereby waives all rights granted by copyright law. You are free to use and distribute the content without any restrictions."}
        </Footer>
    );
};

export default Header;