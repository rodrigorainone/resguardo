import {Router} from 'express'
import { privacy , handlePolicies} from "../middlewares/auth.js";
import userController from "../controllers/users.controller.js"

const router = Router();



router.put('/premium/:uid',privacy('PRIVATED'),handlePolicies(['USER',"PREMIUM","ADMIN"]),userController.changeRole)
router.get('/',userController.getUserAllDTO)
router.delete('/:uid',userController.deleteUser)
router.delete('/',userController.deleteInactivity)
//router.post('/:uid/documents',userController.pepe)


export default router