export default function PageTitle({
  title,
  subtitle,
  count,
  countFor,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  countFor?: string;
}) {
  return (
    <div className="px-6 mt-9 mb-7">
      <h1 className="text-4xl mb-2 capitalize">{title}</h1>
      {subtitle && <h4 className="text-xl text-slate-600">{subtitle}</h4>}

      <div className="my-4">
        {count && count > 0 ? (
          <p className="text-lg text-slate-500">
            You have {count}
            {count > 1 ? " items " : " item "}
            in your {countFor}.
          </p>
        ) : (
          <p className="text-lg text-slate-500">You have no items in your {countFor}.</p>
        )}
      </div>
    </div>
  );
}
