/** What a pipeline step reports. Mirrors the backend's `StepStatus`. */
export type StepStatus = 'not_run' | 'running' | 'completed' | 'failed'

/** A stage that can produce a run. Mirrors the backend's `PipelineStage`. */
export type PipelineStage = 'ingest' | 'transcript' | 'ocr' | 'audio'

/** One pipeline step and where it got to. */
export interface StepResponse {
	stage: PipelineStage
	status: StepStatus
}

/**
 * One ingested stream, as `GET /streams/{stream_id}` returns it.
 *
 * Field names are snake_case because the API's are: renaming at the boundary
 * would mean a second shape to keep in step with the backend for no gain.
 */
export interface StreamResponse {
	id: number
	title: string
	source_path: string
	duration_seconds: number
	file_size_bytes: number
	ingested_at: string
	steps: StepResponse[]
}
