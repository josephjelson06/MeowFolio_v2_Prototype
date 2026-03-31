interface FaqItem {
  question: string;
  answer: string;
}

interface FaqListProps {
  items: FaqItem[];
}

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="pub-faq-list">
      {items.map(item => (
        <details className="pub-faq-item" key={item.question}>
          <summary><span>{item.question}</span><span>+</span></summary>
          <div>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
