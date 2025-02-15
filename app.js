document.addEventListener("DOMContentLoaded", function(){
const formularioEmpleado = document.getElementById("formularioEmpleado");
const companySelect = document.getElementById("companySelect");
const tablaEmpleados = document.querySelector("#tablaEmpleados tbody");

function request_get_delete(metodo, url){

    return new Promise((resolve, reject) =>{

     const request = new XMLHttpRequest();
     request.open(metodo, url)
     request.onload = function (){

            if(request.status >= 200 && request.status < 300){
               const responseText = request.responseText;
                if(responseText){
                  const resultado = JSON.parse(responseText);
                  resolve(resultado)
             }else{
                  resolve(null)
              }
         }else{
                reject("Error: " + request.status + request.responseText)
         }

     }

        request.onerror = function(){
        reject("Error en procesar la solicitud.")
     }

     request.send();
    })
}

function request_post(metodo, url, body){

    return new Promise((resolve, reject) =>{

        const request = new XMLHttpRequest();
        request.open(metodo, url)
        request.setRequestHeader("Content-Type", "application/json")

        request.onload = function (){

            if(request.status >= 200 && request.status <300){
                const responseText = request.responseText;
                if(responseText){
                    const resultado = JSON.parse(responseText)
                    resolve(resultado)
                }else{
                    resolve(null)
                }
            }else{
                reject("Error: " + request.status + request.responseText)
            }

        }

        request.onerror = function (){
            reject("Error en procesar la solicitud.")
        }

        request.send(JSON.stringify(body))

    })

}

async function cargarDatos(){

    try {
        tablaEmpleados.innerHTML= '';
        const companias = await request_get_delete("GET", "https://utn-lubnan-api-1.herokuapp.com/api/Company")
        cargarSelectCompanias(companias);
        cargarEmpleados(companias);
        
    } catch (error) {
        console.error("Error al cargar los datos " , error)
    }

}

function cargarSelectCompanias(companias){

    companySelect.innerHTML = '';
    companias.forEach(comp => {

        const opcion = document.createElement('option')
        opcion.value = comp.companyId
        opcion.textContent = comp.name
        companySelect.appendChild(opcion)
    });

}

async function cargarEmpleados(companias){

    try {
        const empleados = await request_get_delete("GET", "https://utn-lubnan-api-1.herokuapp.com/api/Employee")

        empleados.forEach(emp =>{

            const comp = companias.find(c => c.companyId === emp.companyId)

                if(comp){
                    agregarFilaEmpleado(emp, comp.name)
                }

        })

    } catch (error) {
        console.error("Error al cargar empleados", error)
    }






}

function crearBotonEliminar(empleadoId){

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar"
    botonEliminar.onclick= () => eliminarEmpleado(empleadoId)
    return botonEliminar;

}

function agregarFilaEmpleado(empleado, nombreCompania){

const fila = tablaEmpleados.insertRow();
fila.insertCell(0).textContent = empleado.firstName
fila.insertCell(1).textContent = empleado.lastName
fila.insertCell(2).textContent = empleado.email
fila.insertCell(3).textContent = nombreCompania

const cellEliminar = fila.insertCell(4)
cellEliminar.appendChild(crearBotonEliminar(empleado.employeeId))

}

async function eliminarEmpleado (empleadoId){
    try {
        await request_get_delete("DELETE", "https://utn-lubnan-api-1.herokuapp.com/api/Employee/" + empleadoId)
        cargarDatos();
    } catch (error) {
        console.error("Error al eliminar al empleado ", error)
    }

}

document.addEventListener("submit", async function(event){
event.preventDefault();

    const nuevoEmpleado ={

        companyId: parseInt(companySelect.value),
        firstName:document.getElementById("nombreEmpleado").value,
        lastName:document.getElementById("apellidoEmpleado").value,
        email:document.getElementById("emailEmpleado").value

    }

    try {
        await request_post("POST", "https://utn-lubnan-api-1.herokuapp.com/api/Employee", nuevoEmpleado)
        cargarDatos();
        formularioEmpleado.reset();
    } catch (error) {
        console.error("Error al cargar los datos", error)
    }

})

cargarDatos();
})