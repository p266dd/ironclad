"use client";

import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import AdminSingleOrder from "./admin-single-order";

import { getUserList } from "@/data/user/actions";
import { getProducts } from "@/data/product/action";
import { createAdminOrder } from "@/data/order/action";

// Shadcn
import { Accordion } from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertCircleIcon,
  Check,
  ChevronsUpDown,
  LoaderCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "lucide-react";

// Types
type TOrder = {
  clientId: string | undefined;
  orderProduct: TOrderProduct[];
};

type TOrderProduct = {
  productId: string | undefined;
  details?: string | undefined;
  brand?: string | undefined;
  handle?: string | undefined;
  request?: string | undefined;
};

export default function AdminOrderForm() {
  const [loading, setLoading] = useState(false);

  const [order, setOrder] = useState<TOrder>({
    clientId: undefined,
    orderProduct: [],
  });

  const [clientOpen, setClientOpen] = useState(false);
  const { data: clients, isLoading: loadingClients } = useSWR("getUsers", getUserList);

  const [productOpen, setProductOpen] = useState(false);
  const [currentSelectedProduct, setCurrentSelectedProduct] = useState("");
  const { data: products, isLoading: loadingProducts } = useSWR(
    "getProducts",
    getProducts
  );

  const router = useRouter();

  const handleCreateOrder = async () => {
    setLoading(true);

    if (!order.clientId || order.orderProduct.length === 0) {
      toast.error("Please select a client and at least one product.");
      return;
    }

    const createdOrder = await createAdminOrder({
      clientId: order.clientId,
      orderProduct: order.orderProduct,
    });

    if (createdOrder.error !== null && typeof createdOrder.error === "string") {
      toast.error(createdOrder.error);
      return;
    }

    setOrder({
      clientId: undefined,
      orderProduct: [],
    });

    toast.success("Order created successfully.");
    setCurrentSelectedProduct("");
    setLoading(false);

    router.push("/dashboard/orders/" + createdOrder.data);
  };

  const addSelectedToOrder = () => {
    if (!currentSelectedProduct || !products) {
      toast.error("No product selected.");
      return;
    }

    const productToAdd = products.find((p) => p.id === currentSelectedProduct);

    if (!productToAdd) {
      toast.error("No product found.");
      return;
    }

    // Prevent adding duplicates
    if (order.orderProduct.find((p) => p.productId === productToAdd.id)) {
      setCurrentSelectedProduct("");
      return;
    }

    const newProduct: TOrderProduct = {
      productId: productToAdd.id,
      details: "[]", // Initialize as empty JSON array for size details
      brand: productToAdd.brand,
      handle: productToAdd.handle,
      request: "",
    };

    setOrder((prev) => ({
      ...prev,
      orderProduct: [...prev.orderProduct, newProduct],
    }));

    toast.success("Product added to order.");
    setCurrentSelectedProduct("");
  };

  const saveSize = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData);

    const newQuantity = Number(formObject.newQuantity);
    const cartProductId = formObject.cartProductId;
    const sizeId = Number(formObject.sizeId);

    if (!cartProductId || !sizeId || !newQuantity) {
      toast.error("Invalid form data.");
      return;
    }

    const newSize = {
      sizeId,
      quantity: newQuantity,
    };

    const updatedOrderProduct = order.orderProduct.map((product) => {
      if (product.productId === cartProductId) {
        const details = product.details ? JSON.parse(product.details) : [];
        const index = details.findIndex(
          (d: { sizeId: number; quantity: number }) => d.sizeId === sizeId
        );
        if (index === -1) {
          details.push(newSize);
        } else {
          details[index] = newSize;
        }
        return {
          ...product,
          details: JSON.stringify(details),
        };
      } else {
        return product;
      }
    });

    setOrder((prev) => ({
      ...prev,
      orderProduct: updatedOrderProduct,
    }));

    toast.success("Quantity saved.");
  };

  const saveDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData);

    console.log(formData);

    if (!formObject.productId) {
      toast.error("Invalid form data.");
      return;
    }

    const parseBrand =
      formObject.brand === "other"
        ? String(formObject.brandOther)
        : String(formObject.brand);
    const parseHandle =
      formObject.handle === "other"
        ? String(formObject.handleOther)
        : String(formObject.handle);

    const updatedOrderProduct = order.orderProduct.map((product) => {
      if (product.productId === formObject.productId) {
        return {
          ...product,
          brand: parseBrand,
          handle: parseHandle,
          request: String(formObject.request),
        };
      } else {
        return product;
      }
    });

    setOrder((prev) => ({
      ...prev,
      orderProduct: updatedOrderProduct,
    }));

    toast.success("Details saved.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h4 className="text-2xl font-medium mb-2">Select Client</h4>
        <div>
          <Popover open={clientOpen} onOpenChange={setClientOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={clientOpen}
                className="w-full max-w-[600px] justify-between"
              >
                {clients
                  ? order.clientId
                    ? clients.find((client) => client.id === order.clientId)?.businessName
                    : "Select a client..."
                  : loadingClients
                  ? "Loading clients"
                  : "No user."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full max-w-[600px] p-0">
              <Command>
                <CommandInput placeholder="Search client..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No client found.</CommandEmpty>
                  <CommandGroup>
                    {clients &&
                      clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.id}
                          onSelect={(selected) => {
                            setOrder((prev) => ({
                              ...prev,
                              clientId: selected === order.clientId ? "" : selected,
                            }));
                            setClientOpen(false);
                          }}
                        >
                          {client.businessName}
                          <Check
                            className={cn(
                              "ml-auto",
                              order.clientId === client.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mb-9">
        <h4 className="text-2xl mb-2">Select a Product</h4>
        <div className="mb-2">
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={productOpen}
                className="w-full max-w-[600px] justify-between"
              >
                {products
                  ? currentSelectedProduct
                    ? products.find((product) => product.id === currentSelectedProduct)
                        ?.name
                    : "Select a product..."
                  : loadingProducts
                  ? "Loading products"
                  : "No product."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full max-w-[600px] p-0">
              <Command>
                <CommandInput placeholder="Search product..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {products &&
                      products.length > 0 &&
                      products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.id}
                          onSelect={(selected) => {
                            setCurrentSelectedProduct(selected);
                            setProductOpen(false);
                          }}
                        >
                          {product.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              currentSelectedProduct === product.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button type="button" onClick={addSelectedToOrder}>
          <PlusCircleIcon /> Add to Order
        </Button>
      </div>

      <div>
        <h4 className="text-2xl font-medium mb-5">Products in this order.</h4>
        <div>
          {order && order.orderProduct.length > 0 ? (
            order.orderProduct.map((product) => {
              const fullProduct = products?.find((p) => p.id === product.productId);
              if (!fullProduct) return null;
              // const orderProductDetails = product?.details
              //   ? (JSON.parse(product.details) as { sizeId: number; quantity: number }[])
              //   : [];
              return (
                <Accordion key={product.productId} type="multiple">
                  <AdminSingleOrder
                    fullProduct={fullProduct}
                    order={order}
                    saveSize={saveSize}
                    saveDetails={saveDetails}
                  />
                </Accordion>
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircleIcon /> No products seleted yet.
            </div>
          )}
        </div>
      </div>
      {order && order.orderProduct.length > 0 ? (
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <Button
            type="button"
            onClick={handleCreateOrder}
            variant="default"
            disabled={loading}
          >
            {loading ? <LoaderCircleIcon className="animate-spin" /> : <PlusCircleIcon />}
            {loading ? "Creating order..." : "Create Order"}
          </Button>
          <Button
            type="button"
            onClick={() => setOrder({ clientId: "", orderProduct: [] })}
            variant="outline"
            disabled={loading}
          >
            <TrashIcon /> Clear Order
          </Button>
        </div>
      ) : null}
    </div>
  );
}
