export default function GalleryPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-center">Photo Gallery</h1>
                <p className="text-center text-mut-foreground mb-12 max-w-2xl mx-auto">
                    Memories from our Taravadu Mane - rituals, celebrations, and family moments
                </p>

                <div className="bg-muted/40 border-2 border-dashed rounded-lg p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">Gallery Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">
                            Members can view and upload family photos after logging in to the portal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
