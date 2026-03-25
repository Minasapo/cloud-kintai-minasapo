type RemarksTagsProps = {
  tags: string[];
};

export function RemarksTags({ tags }: RemarksTagsProps) {
  return (
    <>
      {tags.map((tag) => (
        <span key={tag} className="attendance-remarks-item__tag">
          {tag}
        </span>
      ))}
    </>
  );
}
