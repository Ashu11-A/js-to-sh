export interface Arg {
    command: string
    alias: string[]
    description: string
    rank: number
    function: (content?: string) => Promise<void>
    hasString?: boolean
    string?: string
}