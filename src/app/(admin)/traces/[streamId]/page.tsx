import Typography from '@mui/material/Typography'

/** Placeholder. The step list is the next task. */
export default async function TracePage({ params }: { params: Promise<{ streamId: string }> }) {
	const { streamId } = await params
	return <Typography>Trace for stream {streamId}</Typography>
}
