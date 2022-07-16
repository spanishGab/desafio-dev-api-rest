import clsHooked from 'cls-hooked';
import {v4 as uuidv4} from 'uuid';

const REQUEST_NAMESPACE: clsHooked.Namespace = clsHooked.createNamespace(uuidv4);
