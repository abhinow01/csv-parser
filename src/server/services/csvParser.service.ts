import Papa from 'papaparse';

export interface RawRow {
    rowIndex : number ;
    data : Record<string,string>
}

export function parseCsv(fileText: string) : RawRow[]{
    const {data ,errors} = Papa.parse<Record<string , string>>(fileText ,{
        header: true , 
        skipEmptyLines : true , 
        transformHeader : (h)=>h.trim()
    } );
    if(errors.length){
        console.warn("CSV parse warnings:", errors.slice(0,5))
    }
    return data.map((row ,i)=> ({rowIndex : i , data : row }))
}