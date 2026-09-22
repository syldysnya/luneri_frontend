import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function Home() {
	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Typography variant="h1" gutterBottom>
				Luneri
			</Typography>
			<Typography color="text.secondary">
				Open a stream trace at <code>/traces/&lt;stream id&gt;</code>.
			</Typography>
		</Container>
	)
}
