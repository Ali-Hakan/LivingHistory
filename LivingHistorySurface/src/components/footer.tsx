import styles from "../styles/components.module.css";
import { Layout } from "antd";

const Header: React.FC = () => {
    const { Footer } = Layout;
    return (
        <Footer
            className={styles["footer"]}>
            {"© 2023-2023, LivingHistory.com, relinquishes all rights granted by copyright law, feel free to abuse it."}
        </Footer>
    );
};

export default Header;