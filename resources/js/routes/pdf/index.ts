import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:22
 * @route '/pdf/create-blank'
 */
export const createBlank = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlank.url(options),
    method: 'post',
})

createBlank.definition = {
    methods: ["post"],
    url: '/pdf/create-blank',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:22
 * @route '/pdf/create-blank'
 */
createBlank.url = (options?: RouteQueryOptions) => {
    return createBlank.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:22
 * @route '/pdf/create-blank'
 */
createBlank.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlank.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:22
 * @route '/pdf/create-blank'
 */
    const createBlankForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createBlank.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:22
 * @route '/pdf/create-blank'
 */
        createBlankForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createBlank.url(options),
            method: 'post',
        })
    
    createBlank.form = createBlankForm
/**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:105
 * @route '/pdf/upload-image/{fileId}'
 */
export const uploadImage = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadImage.url(args, options),
    method: 'post',
})

uploadImage.definition = {
    methods: ["post"],
    url: '/pdf/upload-image/{fileId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:105
 * @route '/pdf/upload-image/{fileId}'
 */
uploadImage.url = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fileId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fileId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fileId: args.fileId,
                }

    return uploadImage.definition.url
            .replace('{fileId}', parsedArgs.fileId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:105
 * @route '/pdf/upload-image/{fileId}'
 */
uploadImage.post = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadImage.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:105
 * @route '/pdf/upload-image/{fileId}'
 */
    const uploadImageForm = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadImage.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:105
 * @route '/pdf/upload-image/{fileId}'
 */
        uploadImageForm.post = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadImage.url(args, options),
            method: 'post',
        })
    
    uploadImage.form = uploadImageForm
/**
* @see \App\Http\Controllers\PatientPdfController::deleteFile
 * @see app/Http/Controllers/PatientPdfController.php:203
 * @route '/pdf/delete-file/{id}'
 */
export const deleteFile = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFile.url(args, options),
    method: 'delete',
})

deleteFile.definition = {
    methods: ["delete"],
    url: '/pdf/delete-file/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PatientPdfController::deleteFile
 * @see app/Http/Controllers/PatientPdfController.php:203
 * @route '/pdf/delete-file/{id}'
 */
deleteFile.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return deleteFile.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientPdfController::deleteFile
 * @see app/Http/Controllers/PatientPdfController.php:203
 * @route '/pdf/delete-file/{id}'
 */
deleteFile.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFile.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PatientPdfController::deleteFile
 * @see app/Http/Controllers/PatientPdfController.php:203
 * @route '/pdf/delete-file/{id}'
 */
    const deleteFileForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteFile.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PatientPdfController::deleteFile
 * @see app/Http/Controllers/PatientPdfController.php:203
 * @route '/pdf/delete-file/{id}'
 */
        deleteFileForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteFile.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteFile.form = deleteFileForm
const pdf = {
    createBlank: Object.assign(createBlank, createBlank),
uploadImage: Object.assign(uploadImage, uploadImage),
deleteFile: Object.assign(deleteFile, deleteFile),
}

export default pdf