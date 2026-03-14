import patients from './patients'
const namespaced = {
    patients: Object.assign(patients, patients),
}

export default namespaced