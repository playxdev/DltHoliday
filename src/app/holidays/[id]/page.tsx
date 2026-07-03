import EditHolidayForm from "./edit-form";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default async function EditHolidayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditHolidayForm id={id} />;
}
