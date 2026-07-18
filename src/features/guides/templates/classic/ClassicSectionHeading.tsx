import { classicPreviewStyles as styles } from "./classic.styles";

type ClassicSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ClassicSectionHeading({
  eyebrow,
  title,
  description,
}: ClassicSectionHeadingProps) {
  return (
    <header>
      <p className={styles.eyebrow}>
        {eyebrow}
      </p>

      <h2 className={styles.title}>
        {title}
      </h2>

      <p className={styles.description}>
        {description}
      </p>
    </header>
  );
}