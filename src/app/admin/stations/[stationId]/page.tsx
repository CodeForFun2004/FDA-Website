import PageContainer from '@/components/layout/page-container';
import StationDetailView from '@/features/stations/views/station-detail-view';

export const metadata = {
  title: 'Admin: Station Detail'
};

type PageProps = {
  params: Promise<{ stationId: string }>;
};

export default async function Page(props: PageProps) {
  const { stationId } = await props.params;

  return (
    <PageContainer scrollable>
      <StationDetailView stationId={stationId} />
    </PageContainer>
  );
}
