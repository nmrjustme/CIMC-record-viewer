import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:18
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
 * @see app/Http/Controllers/PatientPdfController.php:18
 * @route '/pdf/create-blank'
 */
createBlank.url = (options?: RouteQueryOptions) => {
    return createBlank.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:18
 * @route '/pdf/create-blank'
 */
createBlank.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlank.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:18
 * @route '/pdf/create-blank'
 */
    const createBlankForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createBlank.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PatientPdfController::createBlank
 * @see app/Http/Controllers/PatientPdfController.php:18
 * @route '/pdf/create-blank'
 */
        createBlankForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createBlank.url(options),
            method: 'post',
        })
    
    createBlank.form = createBlankForm
/**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:111
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
 * @see app/Http/Controllers/PatientPdfController.php:111
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
 * @see app/Http/Controllers/PatientPdfController.php:111
 * @route '/pdf/upload-image/{fileId}'
 */
uploadImage.post = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadImage.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:111
 * @route '/pdf/upload-image/{fileId}'
 */
    const uploadImageForm = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadImage.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PatientPdfController::uploadImage
 * @see app/Http/Controllers/PatientPdfController.php:111
 * @route '/pdf/upload-image/{fileId}'
 */
        uploadImageForm.post = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadImage.url(args, options),
            method: 'post',
        })
    
    uploadImage.form = uploadImageForm
const pdf = {
    createBlank: Object.assign(createBlank, createBlank),
uploadImage: Object.assign(uploadImage, uploadImage),
}

export default pdf