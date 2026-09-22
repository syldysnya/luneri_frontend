import Typography from '@mui/material/Typography'

/** Placeholder. The ingest detail is the next task. */
export default async function IngestPage({ params }: { params: Promise<{ streamId: string }> }) {
	const { streamId } = await params
	return <Typography>Ingest detail for stream {streamId}</Typography>
}
