import React, { useEffect, useRef, useState } from 'react';
import { X, Save, ImagePlus, AlertCircle } from 'lucide-react';
import { Product, Category } from '../types/index.ts';

interface EditProductModalProps {
  product: Product | null;
  token: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, token, onClose, onSaved }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [titleAmharic, setTitleAmharic] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [region, setRegion] = useState('');
  const [woreda, setWoreda] = useState('');
  const [city, setCity] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) return;
    setTitle(product.title || '');
    setTitleAmharic(product.title_amharic || '');
    setDescription(product.description || '');
    setPrice(String(product.price ?? ''));
    setStock(String(product.stock ?? 1));
    setCondition(product.condition || 'new');
    setCategoryId(Number((product as any).category_id) || '');
    setRegion(product.region || '');
    setWoreda(product.woreda || '');
    setCity(product.city || '');
    setNewImages([]);
    setError('');
  }, [product]);

  useEffect(() => {
    if (!product) return;
    fetch('/api/categories').then(res => res.ok ? res.json() : []).then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => setCategories([]));
  }, [product?.id]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    const loaded = await Promise.all(files.filter(f => f.type.startsWith('image/')).map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read selected image.'));
      reader.readAsDataURL(file);
    })));
    setNewImages(loaded);
    if (fileRef.current) fileRef.current.value = '';
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !token) return;
    setSaving(true);
    setError('');
    try {
      const body: Record<string, any> = {
        title: title.trim(), titleAmharic: titleAmharic.trim() || null,
        description: description.trim(), price: Number(price), stock: Number(stock),
        condition, categoryId: categoryId || null, region: region.trim(), woreda: woreda.trim(), city: city.trim()
      };
      if (newImages.length) body.images = newImages;
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Product update failed.');
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Product update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={save} className="w-full max-w-xl bg-white rounded-2xl shadow-2xl my-6 overflow-hidden">
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold">የእቃ መረጃ አስተካክል (Edit Product)</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
          <label className="block text-xs font-bold text-gray-700">የእቃ ስም<input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 font-normal" /></label>
          <label className="block text-xs font-bold text-gray-700">የአማርኛ ስም<input value={titleAmharic} onChange={e => setTitleAmharic(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 font-normal" /></label>
          <label className="block text-xs font-bold text-gray-700">መግለጫ<textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 font-normal" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold text-gray-700">ዋጋ (ETB)<input required type="number" min="0.01" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 font-normal" /></label>
            <label className="block text-xs font-bold text-gray-700">ብዛት<input required type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 font-normal" /></label>
          </div>
          <label className="block text-xs font-bold text-gray-700">ምድብ (Category)<select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')} className="mt-1 w-full border rounded-lg p-2.5 font-normal"><option value="">ያለውን ምድብ ይጠቀሙ</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="block text-xs font-bold text-gray-700">የእቃ ሁኔታ<select value={condition} onChange={e => setCondition(e.target.value as 'new' | 'used')} className="mt-1 w-full border rounded-lg p-2.5 font-normal"><option value="new">አዲስ እቃ</option><option value="used">ያገለገለ እቃ</option></select></label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block text-xs font-bold text-gray-700">ክልል<input value={region} onChange={e => setRegion(e.target.value)} className="mt-1 w-full border rounded-lg p-2 font-normal" /></label>
            <label className="block text-xs font-bold text-gray-700">ወረዳ<input value={woreda} onChange={e => setWoreda(e.target.value)} className="mt-1 w-full border rounded-lg p-2 font-normal" /></label>
            <label className="block text-xs font-bold text-gray-700">ከተማ<input value={city} onChange={e => setCity(e.target.value)} className="mt-1 w-full border rounded-lg p-2 font-normal" /></label>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-xs font-bold text-emerald-800 border border-emerald-200 rounded-lg px-3 py-2"><ImagePlus className="w-4 h-4" /> አዲስ ፎቶዎች ይምረጡ</button>
            <p className="text-[10px] text-gray-500 mt-1">ፎቶ ካልመረጡ ነባሩ ፎቶ አይቀየርም።</p>
            {newImages.length > 0 && <div className="flex gap-2 mt-2">{newImages.map((img, i) => <img key={i} src={img} alt="New product" className="w-14 h-14 object-cover rounded-lg" />)}</div>}
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600">ይቅር</button><button disabled={saving} className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}</button></div>
      </form>
    </div>
  );
};
