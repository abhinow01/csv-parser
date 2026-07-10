"use client"
interface Props {
    columns : string[],
    rows : Record<string, string | undefined>[];
    emptyLabel?:string;
    maxHeight?:string
}

export function DataTable({columns , rows , emptyLabel ="No rows" , maxHeight='60vh'}:Props){
    if(!rows.length){
        return (
            <div className="text-center text-sm text-gray-400 py-12 border rounded-xl border-gray-200 dark:border-gray-800">
                {emptyLabel}
            </div>
        )
    }
    return (
        <div className="w-full overflow-auto rounded-xl border border-gray-200 dark:border-gray-800"
        style={{maxHeight}}>
        <table className="min-w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-sm">
        <tr>
            {
                columns.map((col)=>(
                    <th
                    key={col}
                    className="text-left font-semibold text-gray-600 dark:text-gray-300 px-4 py-3 whitespace-nowrap border-b border-gray-200 dark:border-gray-800"
                    >
                    {col}
                    </th>
                ))}
        </tr>
        </thead>
        <tbody>
            {
                rows.map((row , i)=> (
                    <tr
                    key={i}
                    className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-950 dark:even:bg-gray-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    >
                       {
                        columns.map((col)=>(
                            <td
                            key={col}
                            className="px-4 py-2.5 whitespace-nowrap text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-900"
                            >
                            {row[col] ?? ""}
                            </td>
                        ))
                       } 
                    </tr>
                ))
            }
        </tbody>
        </table>
        </div>
    )
}