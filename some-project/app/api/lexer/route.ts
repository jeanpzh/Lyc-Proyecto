
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
    try {
        const data = await req.json(); 
        console.log(data.code)
        const resultado = interpretarCodigo(data.code);
        console.log(resultado)
        return NextResponse.json({ resultado });
    } catch (error: any) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
};

// Función para interpretar el código
function interpretarCodigo(codigo: string): string {
    console.log(codigo)
    const lineas = codigo.split('\n').map(linea => linea.trim()).filter(linea => linea && !linea.startsWith('//'));
    
    const variables: { [key: string]: any } = {};
    let salida = '';

    lineas.forEach((linea, indice) => {
        try {
            if (linea.startsWith('cout<<')) {
                const expr = linea.slice(6).replace(';', '').trim();
                salida = evaluarExpresion(expr, variables);
            } else {
                const [izquierda, derecha] = linea.split('=');
                if (!izquierda || !derecha) {
                    throw new Error(`Línea ${indice + 1}: Asignación inválida.`);
                }
                const nombreVar = izquierda.trim();
                const expr = derecha.replace(';', '').trim();
                variables[nombreVar] = evaluarExpresion(expr, variables);
            }
        } catch (error : any) {
            throw new Error(`Línea ${indice + 1}: ${error.message}`);
        }
    });

    return salida;
}

function evaluarExpresion(expr: string, variables: { [key: string]: any }): any {
    const exprReemplazada = expr.replace(/[a-zA-Z_]\w*/g, match => {
        if (variables[match] !== undefined) {
            return variables[match];
        } else {
            throw new Error(`Variable no inicializada: ${match}`);
        }
    });
    
    const operadoresProhibidos = ['++', '--', '==', '!=', '>', '<', '>=', '<='];
    operadoresProhibidos.forEach(op => {
        if (exprReemplazada.includes(op)) {
            throw new Error(`Operador prohibido: ${op}`);
        }
    });

    try {
        return new Function(`return ${exprReemplazada}`)();
    } catch (err) {
        throw new Error(`Expresión Inválida: ${expr}`);
    }
}
