
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
    currentImageUrl?: string | null;
    onUploadComplete: (url: string) => Promise<void>;
    bucket: string;
    folderPath: string;
    disabled?: boolean;
    imageHint?: string;
    className?: string;
}

export function ImageUploader({
    currentImageUrl,
    onUploadComplete,
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

        const supabase = createSupabaseBrowserClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: uploadError.message,
            });
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
        
        await onUploadComplete(publicUrl);

        setLocalImageUrl(publicUrl);
        setUploading(false);
        toast({
            title: 'Image Updated!',
            description: 'Your new image has been saved.',
        });
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
