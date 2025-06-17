export default function PageTitle({
  title,
  subtitle,
  showCount,
  count,
  countFor,
  className,
}: {
  title: string;
  subtitle?: string;
  showCount?: boolean;
  count?: number;
  countFor?: string;
  className?: string;
}) {
  return (
    <div className={`mt-9 mb-7 ${className}`}>
      <h1 className="text-4xl font-semibold mb-2 capitalize">{title}</h1>
      {subtitle && <h4 className=" text-slate-600">{subtitle}</h4>}

      {showCount ? (
        count ? (
          <div className="my-4">
            <p className="text-lg text-slate-500">
              You have {count}
              {count > 1 ? " items " : " item "}
              in your {countFor}.
            </p>
          </div>
        ) : (
          <div className="my-4">
            <p className="text-lg text-slate-500">
              You have no items in your {countFor}.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
