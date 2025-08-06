
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/image-compressor';

interface ImageUploaderProps {
    currentImageUrl?: string | null;
    onUploadComplete: (url: string) => Promise<void>;
    setParentPending?: (pending: boolean) => void;
    dbUpdateAction?: (url: string) => Promise<any>;
    bucket: string;
    folderPath: string;
    disabled?: boolean;
    imageHint?: string;
    className?: string;
}

export function ImageUploader({
    currentImageUrl,
    onUploadComplete,
    setParentPending = () => {},
    dbUpdateAction,
    bucket,
    folderPath,
    disabled = false,
    imageHint,
    className
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [localImageUrl, setLocalImageUrl] = useState(currentImageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setParentPending(true);

        try {
            const compressedFile = await compressImage(file);
            const supabase = createSupabaseBrowserClient();
            const fileExt = compressedFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${folderPath}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, compressedFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            if (dbUpdateAction) {
                await dbUpdateAction(publicUrl);
            } else {
                 await onUploadComplete(publicUrl);
            }
            

            setLocalImageUrl(publicUrl);
            toast({
                title: 'Image Updated!',
                description: 'Your new image has been saved.',
            });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: error.message || 'Could not upload the image.',
            });
        } finally {
            setUploading(false);
            setParentPending(false);
        }
    };

    return (
        <div className={cn("flex items-center gap-4", className)}>
            <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                    src={localImageUrl || 'https://placehold.co/100x100.png'}
                    alt="Current image"
                    fill
                    className="rounded-md bg-muted object-cover"
                    data-ai-hint={imageHint}
                />
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                disabled={uploading || disabled}
            />
            <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || disabled}
            >
                {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ImageIcon className="mr-2 h-4 w-4" />
                )}
                {uploading ? 'Uploading...' : 'Change Image'}
            </Button>
        </div>
    );
}
