"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import type { Product } from "./types";

type Props = {
  product?: Product;
  categories: string[];
  units: string[];
  existingSkus: string[]; // SKU milik produk lain (untuk cek duplikat)
  onClose: () => void;
  onSave: (product: Product, openingStock: number) => void;
};

type Errors = Partial<Record<"name" | "sku" | "cost" | "price" | "min" | "opening", string>>;

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

export default function ProductModal({ product, categories, units, existingSkus, onClose, onSave }: Props) {
  const editing = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [category, setCategory] = useState(product?.category ?? categories[0] ?? "");
  const [unit, setUnit] = useState(product?.unit ?? units[0] ?? "pcs");
  const [cost, setCost] = useState(String(product?.cost ?? ""));
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [min, setMin] = useState(String(product?.min ?? "10"));
  const [opening, setOpening] = useState("0");
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Enter the product name.";
    if (!sku.trim()) next.sku = "Enter a SKU.";
    else if (existingSkus.some((s) => s.toLowerCase() === sku.trim().toLowerCase())) next.sku = "This SKU is already used.";
    if (!(num(cost) >= 0)) next.cost = "Enter a valid cost.";
    if (!(num(price) >= 0)) next.price = "Enter a valid price.";
    if (!(num(min) >= 0)) next.min = "Enter a valid minimum.";
    if (!editing && !(num(opening) >= 0)) next.opening = "Enter a valid quantity.";
    setErrors(next);
    if (Object.keys(next).length) return;

    onSave(
      {
        id: product?.id ?? `p${Date.now()}`,
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unit,
        cost: num(cost),
        price: num(price),
        min: num(min),
        stock: product?.stock ?? {},
        active: true,
      },
      editing ? 0 : num(opening),
    );
  }

  return (
    <Modal title={editing ? "Edit product" : "Add product"} onClose={onClose} size="lg">
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <Field id="p-name" label="Product name" error={errors.name}>
            <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kopi Arabika 250g" className={fieldCls(!!errors.name)} />
          </Field>
          <Field id="p-sku" label="SKU" error={errors.sku}>
            <input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="KA-250" className={fieldCls(!!errors.sku)} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="p-cat" label="Category">
            <select id="p-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field id="p-unit" label="Unit">
            <select id="p-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="p-cost" label="Cost price (Rp)" error={errors.cost}>
            <input id="p-cost" type="number" min={0} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} className={fieldCls(!!errors.cost)} />
          </Field>
          <Field id="p-price" label="Selling price (Rp)" error={errors.price}>
            <input id="p-price" type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={fieldCls(!!errors.price)} />
          </Field>
          <Field id="p-min" label="Minimum stock" error={errors.min} hint="Alert when stock is at or below this.">
            <input id="p-min" type="number" min={0} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} className={fieldCls(!!errors.min)} />
          </Field>
        </div>

        {!editing && (
          <Field id="p-open" label="Opening stock (main warehouse)" error={errors.opening}>
            <input id="p-open" type="number" min={0} inputMode="numeric" value={opening} onChange={(e) => setOpening(e.target.value)} className={fieldCls(!!errors.opening)} />
          </Field>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {editing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
