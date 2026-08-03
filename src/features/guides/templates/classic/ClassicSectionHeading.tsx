import { ClassicEyebrow } from "./ClassicEyebrow";
import { classicPreviewInlineStyles as inlineStyles, classicPreviewStyles as styles } from "./classic.styles";

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
      <ClassicEyebrow>{eyebrow}</ClassicEyebrow>

      <h2 className={styles.title} style={inlineStyles.title}>
        {title}
      </h2>

      <p className={styles.description} style={inlineStyles.description}>
        {description}
      </p>
    </header>
  );
}
