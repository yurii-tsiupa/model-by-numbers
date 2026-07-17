import { classicPreviewStyles as styles } from "./classic.styles";
export function ClassicSectionHeading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){return <header><p className={styles.eyebrow}>{eyebrow}</p><h2 className={styles.title}>{title}</h2><p className={styles.description}>{description}</p></header>}
