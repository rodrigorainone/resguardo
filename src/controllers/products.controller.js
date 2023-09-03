import {productService} from "../services/index.js";
import ErrorService from "../services/ErrorService.js";
import {productErrorIncompleteValues} from "../constants/productErrors.js"
import EErrors from "../constants/EErrors.js";
import { tr } from "@faker-js/faker";
import { transport } from "../app.js";

const getProducts = async (req,res) =>{
    try{
        
        let {page=1} = req.query;
        let {limit=10} = req.query
        let {sort} = req.query
        let {category} = req.query;
        let {status} = req.query;
        let sortAux;
        if (sort!==undefined){
          if (sort =="asc"){
            sortAux = 1;
         }
         else{
           if (sort=="desc"){
             sortAux = -1;
           }    
         }
        }  
        const {docs,hasPrevPage,hasNextPage,prevPage,nextPage, ...rest} =  await productService.getProductsPaginate(page,limit,sortAux,category,status); 
        
        const product = docs;  
        let prevLink;
        let nextLink;
        if (limit==undefined){
            limit="";
        }
        if (sort==undefined){
            sort="";
        }
        if (category==undefined){
            category="";
        }
        if (status==undefined){
            status="";
        }
        if (hasPrevPage==false){
            prevLink =null;
        }
        else {
           
            prevLink =`/?page=${prevPage}&&limit=${limit}&&sort=${sort}&&category=${category}&&status=${status}`;
        }
        if (hasNextPage==false){
            nextLink=null;
        }
        else {
            nextLink= `/?page=${nextPage}&&limit=${limit}&&sort=${sort}&&category=${category}&&status=${status}`;
        }
    
        res.send({status:"success",payload:product,totalpage:rest.totalPages,prevPage,nextPage,page:rest.page,hasPrevPage,hasNextPage,prevLink,nextLink})
        }
        catch(error){
            return { status: 'error', message: "Error en getAll MongoDB: " + error, value: null}
        }
}

const getProductsByID = async (req,res) =>{

    
    const aux = await productService.getProductsByID(req.params.pid);
   if (!aux){
    return res.send("no existe el producto")
   }

    return res.send(aux)
}

const createProduct = async (req,res,next)=>{   
    try {
        const datos = req.body;
    const { title, description, price, thumbnail=[], code, stock,category, status ,owner } = datos  
    if (!owner){
        datos.owner='admin'
    }   
    if (title && description && price && status && code && stock && category && owner){
        await productService.createProduct(datos) 
        return res.send({status:"success"}) 
    }
    else {
        ErrorService.createError({
            name:"Error de creación de producto",
            cause: productErrorIncompleteValues({title,description,price,thumbnail,code,stock,category,status,owner}),
            message: 'Error intentando insertar un nuevo producto',
            code: EErrors.INCOMPLETE_VALUES,
            status:400
        })
               
        return res.send({status:"alguno de los campos no fue completado"}) 
    }
    } catch (error) {
        req.logger.error(error);
        next(error);
    } 
    
}

const updateProduct =  async (req,res)=>{    
    const idAux = req.params.pid;    
    const datos = req.body; 
    const aux = await productService.updateProduct(idAux,datos)     
    if (!aux){
        return res.send({status:"no success"})
    }   
    res.send({status:"success"})   

}

const deleteProduct =  async (req,res)=>{     
    console.log(req.session.user);    
    const idAux = req.params.pid;
    const borrado = await productService.deleteProduct(idAux)  
    console.log(borrado)
    if (borrado.owner !== 'admin'){
        const result = await transport.sendMail({
            from:'Ecommerce Tuky <rodrigorainone@gmail.com>',
            to:borrado.owner,
            subject:'Producto eliminado',
            html:`
            <div>
                <h1>Hola, el producto que ah creado fue eliminado por el admin</h1>
                <p>Producto:${borrado.id}</p>
                
                

            </div>
            `                            
         })
    }
    
    
    if (!borrado)  {
        return res.send({status:" no success"})
    }
    return res.send({status:"si success"})

}

export default {
    getProducts,
    getProductsByID,
    createProduct,
    updateProduct,
    deleteProduct
}