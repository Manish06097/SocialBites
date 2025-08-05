
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
    };

    try {
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed image successfully. Original: ${(file.size / 1024).toFixed(2)} KB, Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`);
        return compressedFile;
    } catch (error) {
        console.error('Error during image compression:', error);
        // If compression fails, return the original file
        return file;
    }
}
