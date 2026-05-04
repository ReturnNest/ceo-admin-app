import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import {
    Upload,
    X,
    Plus,
    MapPin,
    FileText,
    DollarSign,
    ShieldCheck
} from 'lucide-react';

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

type ListingType = 'Real Estate' | 'Land' | 'Agriculture' | 'Houses' | 'Apartments' | 'Shortlet' | 'Science' | 'Arts' | 'Startups' | 'Commercial';

export const AdminCreateListing: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        valuation: '',
        minInvestment: '1000', // Default 1000
        location: '',
        description: '',
        realEstateName: '',
        realEstateContact: '',
        realEstateAgent: '',
        internalNotes: ''
    });
    const [type, setType] = useState<ListingType>('Real Estate');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages([...images, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in.');

            // Upload images to Supabase Storage
            const imageUrls: string[] = [];

            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Upload error details:', uploadError);
                    throw new Error(`Failed to upload media: ${uploadError.message}`);
                }
                console.log('Successfully uploaded image:', fileName);

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('listings')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);
            }

            // Use RPC
            const numericValuation = parseFloat(formData.valuation) || 0;
            const numericMinInvestment = parseFloat(formData.minInvestment) || 1000;

            console.log('Calling create_listing RPC with:', {
                p_title: formData.title,
                p_type: type
            });

            const { error } = await supabase.rpc('create_listing', {
                p_title: formData.title,
                p_type: type, // Match Marketplace case exactly
                p_valuation: numericValuation,
                p_location: formData.location,
                p_address: formData.location,
                p_description: formData.description,
                p_seller_id: user.id,
                p_target_amount: numericValuation,
                p_min_investment: numericMinInvestment,
                p_images: imageUrls,
                p_status: 'active',
                p_real_estate_name: formData.realEstateName,
                p_real_estate_contact: formData.realEstateContact,
                p_real_estate_agent: formData.realEstateAgent,
                p_internal_notes: formData.internalNotes
            });

            if (error) throw error;

            console.log('Listing created successfully!');
            setSuccess(true);
            
            // Reset form
            setFormData({ 
                title: '', 
                valuation: '', 
                minInvestment: '1000', 
                location: '', 
                description: '',
                realEstateName: '',
                realEstateContact: '',
                realEstateAgent: '',
                internalNotes: ''
            });
            setImages([]);
            setPreviews([]);
            setType('Real Estate');

            // Redirect after delay
            setTimeout(() => {
                window.location.href = '/admin/private-records';
            }, 2000);

        } catch (err: any) {
            console.error('Error creating listing full detail:', err);
            const errorMessage = err.message || JSON.stringify(err);
            alert(`Failed to create listing: ${errorMessage}\n\nMake sure you have run the latest SQL migrations (including 20260504_cross_app_sync.sql) in Supabase!`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <ShieldCheck className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Listing Deployed Successfully!</h3>
                        <p className="text-emerald-400/80">The project is now live. Redirecting to private records...</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Create New Offering</h2>
                    <p className="text-slate-400 mt-1">Deploy a new investment project to the marketplace.</p>
                </div>
                <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
                    {(['Real Estate', 'Land', 'Agriculture', 'Houses', 'Apartments', 'Shortlet', 'Science', 'Arts', 'Startups', 'Commercial'] as ListingType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            type="button"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                type === t ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Project Specification</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Project Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Blue Lagoon Estates"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Total Valuation (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="number"
                                    required
                                    value={formData.valuation}
                                    onChange={e => setFormData({ ...formData, valuation: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Minimum Investment (Entry Price)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="number"
                                    required
                                    value={formData.minInvestment}
                                    onChange={e => setFormData({ ...formData, minInvestment: e.target.value })}
                                    placeholder="1000"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Location Description</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-500" />
                            <textarea
                                rows={2}
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Enter full address or GPS coordinates..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Detailed Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the investment opportunity..."
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        ></textarea>
                    </div>
                </div>

                {/* Internal Admin Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Internal Administration (Private)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Real Estate Company Name</label>
                            <input
                                type="text"
                                value={formData.realEstateName}
                                onChange={e => setFormData({ ...formData, realEstateName: e.target.value })}
                                placeholder="Internal record of property owner"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Contact Information</label>
                            <input
                                type="text"
                                value={formData.realEstateContact}
                                onChange={e => setFormData({ ...formData, realEstateContact: e.target.value })}
                                placeholder="Phone, Email, or Web Link"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Assigned Agent</label>
                            <input
                                type="text"
                                value={formData.realEstateAgent}
                                onChange={e => setFormData({ ...formData, realEstateAgent: e.target.value })}
                                placeholder="Main point of contact"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Internal Admin Notes</label>
                        <textarea
                            rows={3}
                            value={formData.internalNotes}
                            onChange={e => setFormData({ ...formData, internalNotes: e.target.value })}
                            placeholder="Confidential notes regarding this deal..."
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                        ></textarea>
                    </div>
                </div>

                {/* Media Upload */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Upload className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Media & Assets</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-black">
                                {images[i]?.type.startsWith('video/') ? (
                                    <video src={src} className="h-full w-full object-cover" controls />
                                ) : (
                                    <img src={src} className="h-full w-full object-cover" alt="preview" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl cursor-pointer transition-all group">
                            <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleImageChange} />
                            <Plus className="h-8 w-8 text-slate-500 group-hover:text-blue-400 mb-2" />
                            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-400 uppercase tracking-widest text-center px-2">Add Image/Video</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        {loading ? 'Deploying...' : 'Deploy Project to Marketplace'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({ 
                                title: '', 
                                valuation: '', 
                                minInvestment: '1000', 
                                location: '', 
                                description: '',
                                realEstateName: '',
                                realEstateContact: '',
                                realEstateAgent: '',
                                internalNotes: ''
                            });
                            setImages([]);
                            setPreviews([]);
                        }}
                        className="px-8 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
