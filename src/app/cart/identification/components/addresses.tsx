"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { shippingAddressTable } from "@/db/schema";

import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";
import { useDeleteShippingAddress } from "@/hooks/mutations/use-delete-shipping-address";
import { useUserAddresses } from "@/hooks/queries/use-user-addresses";

import { formatAddress } from "../../helpers/address";
import { ShippingPreview } from "./shipping-preview";

// ------------------------------
// FORM SCHEMA
// ------------------------------
const formSchema = z.object({
  email: z.email("E-mail inválido"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().min(14, "CPF inválido"),
  phone: z.string().min(15, "Celular inválido"),
  zipCode: z.string().min(9, "CEP inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressesProps {
  shippingAddresses: (typeof shippingAddressTable.$inferSelect)[];
  defaultShippingAddressId: string | null;
}

// ------------------------------
// COMPONENT
// ------------------------------
const Addresses = ({
  shippingAddresses,
  defaultShippingAddressId,
}: AddressesProps) => {
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultShippingAddressId || null,
  );

  const [selectedMethod, setSelectedMethod] = useState<{
    method: "cold" | "sedex" | "pac";
    price: number;
  } | null>(null);

  const createShippingAddressMutation = useCreateShippingAddress();
  const updateCartShippingAddressMutation = useUpdateCartShippingAddress();
  const deleteShippingAddressMutation = useDeleteShippingAddress();

  const { data: addresses, isLoading } = useUserAddresses({
    initialData: shippingAddresses,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      cpf: "",
      phone: "",
      zipCode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  // ------------------------------
  // CREATE NEW ADDRESS
  // ------------------------------
  const onSubmit = async (values: FormValues) => {
    try {
      const newAddress =
        await createShippingAddressMutation.mutateAsync(values);

      toast.success("Endereço criado com sucesso!");
      form.reset();
      setSelectedAddress(newAddress.id);

      // Vínculo inicial sem método selecionado ainda
      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: newAddress.id,
        shippingMethod: "cold",
        shippingPrice: 0,
      });

      toast.success("Endereço vinculado ao carrinho!");
    } catch {
      toast.error("Erro ao criar endereço. Tente novamente.");
    }
  };

  // ------------------------------
  // GO TO PAYMENT
  // ------------------------------
  const handleGoToPayment = async () => {
    if (!selectedAddress || selectedAddress === "add_new") return;

    if (!selectedMethod) {
      toast.error("Selecione um método de entrega antes de continuar.");
      return;
    }

    try {
      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: selectedAddress,
        shippingMethod: selectedMethod.method,
        shippingPrice: selectedMethod.price,
      });

      router.push("/cart/confirmation");
    } catch {
      toast.error("Erro ao selecionar método de entrega.");
    }
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <Card className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] text-white">
      <CardHeader>
        <CardTitle>Identificação</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center">
            <p>Carregando endereços...</p>
          </div>
        ) : (
          <RadioGroup
            value={selectedAddress ?? ""}
            onValueChange={(value) => {
              setSelectedAddress(value);
              setSelectedMethod(null); // Resetar frete ao mudar endereço
            }}
          >
            {addresses?.map((address) => (
              <Card
                key={address.id}
                className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]"
              >
                <CardContent>
                  <div className="flex items-start justify-between text-white">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value={address.id} id={address.id} />

                      <Label htmlFor={address.id} className="cursor-pointer">
                        <p className="text-sm">{formatAddress(address)}</p>
                      </Label>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await deleteShippingAddressMutation.mutateAsync(
                            address.id,
                          );
                          toast.success("Endereço excluído!");

                          if (selectedAddress === address.id) {
                            setSelectedAddress(null);
                          }
                        } catch {
                          toast.error("Erro ao excluir endereço");
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </div>

                  {/* FRETE PARA O ENDEREÇO SELECIONADO */}
                  {selectedAddress === address.id && (
                    <ShippingPreview
                      addressId={address.id}
                      city={address.city}
                      state={address.state}
                      onSelect={(method, price) => {
                        setSelectedMethod({ method, price });
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            {/* ADD NEW ADDRESS */}
            <Card className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]">
              <CardContent>
                <div className="flex items-center space-x-2 text-white">
                  <RadioGroupItem value="add_new" id="add_new" />
                  <Label htmlFor="add_new">Adicionar novo endereço</Label>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        )}

        {/* IR PARA PAGAMENTO */}
        {selectedAddress && selectedAddress !== "add_new" && (
          <Button
            onClick={handleGoToPayment}
            className="mt-4 w-full"
            disabled={updateCartShippingAddressMutation.isPending}
          >
            {updateCartShippingAddressMutation.isPending
              ? "Processando..."
              : "Ir para pagamento"}
          </Button>
        )}

        {/* FORM DE NOVO ENDEREÇO */}
        {selectedAddress === "add_new" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "email", label: "Email" },
                  { name: "fullName", label: "Nome completo" },
                  { name: "address", label: "Endereço" },
                  { name: "number", label: "Número" },
                  { name: "neighborhood", label: "Bairro" },
                  { name: "city", label: "Cidade" },
                  { name: "state", label: "Estado" },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as any}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input {...f} className="border-blue-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* CPF */}
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CELULAR */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CEP */}
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  createShippingAddressMutation.isPending ||
                  updateCartShippingAddressMutation.isPending
                }
              >
                {createShippingAddressMutation.isPending
                  ? "Salvando..."
                  : "Salvar endereço"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default Addresses;
