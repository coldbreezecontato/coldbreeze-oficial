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

const Addresses = ({
  shippingAddresses,
  defaultShippingAddressId,
}: AddressesProps) => {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultShippingAddressId || null,
  );

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

  const onSubmit = async (values: FormValues) => {
    try {
      const newAddress = await createShippingAddressMutation.mutateAsync(values);
      toast.success("Endereço criado com sucesso!");
      form.reset();
      setSelectedAddress(newAddress.id);

      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: newAddress.id,
      });
      toast.success("Endereço vinculado ao carrinho!");
    } catch {
      toast.error("Erro ao criar endereço. Tente novamente.");
    }
  };

  const handleGoToPayment = async () => {
    if (!selectedAddress || selectedAddress === "add_new") return;

    try {
      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: selectedAddress,
      });
      toast.success("Endereço selecionado para entrega!");
      router.push("/cart/confirmation");
    } catch {
      toast.error("Erro ao selecionar endereço. Tente novamente.");
    }
  };

  return (
    <Card className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] text-white">
      <CardHeader>
        <CardTitle>Identificação</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Lista de endereços */}
        {isLoading ? (
          <div className="py-4 text-center">
            <p>Carregando endereços...</p>
          </div>
        ) : (
          <RadioGroup value={selectedAddress ?? ""} onValueChange={setSelectedAddress}>
            {addresses?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Você ainda não possui endereços cadastrados.
              </p>
            )}

            {addresses?.map((address) => (
              <Card
                key={address.id}
                className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]"
              >
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value={address.id} id={address.id} />

                      <Label htmlFor={address.id} className="cursor-pointer flex-1">
                        <p className="text-sm">{formatAddress(address)}</p>
                      </Label>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await deleteShippingAddressMutation.mutateAsync(address.id);
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

                  {/* 🔥 FRETE DO ENDEREÇO SELECIONADO */}
                  {selectedAddress === address.id && (
                    <ShippingPreview city={address.city} state={address.state} />
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Opção de adicionar novo */}
            <Card className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]">
              <CardContent>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add_new" id="add_new" />
                  <Label htmlFor="add_new">Adicionar novo endereço</Label>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        )}

        {/* Botão "Ir para pagamento" */}
        {selectedAddress && selectedAddress !== "add_new" && (
          <Button
            onClick={handleGoToPayment}
            className="w-full mt-4"
            disabled={updateCartShippingAddressMutation.isPending}
          >
            {updateCartShippingAddressMutation.isPending ? "Processando..." : "Ir para pagamento"}
          </Button>
        )}

        {/* Formulário de novo endereço */}
        {selectedAddress === "add_new" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "email", label: "Email", placeholder: "Digite seu email" },
                  { name: "fullName", label: "Nome completo", placeholder: "Seu nome" },
                  { name: "address", label: "Endereço", placeholder: "Rua, avenida..." },
                  { name: "number", label: "Número", placeholder: "123" },
                  { name: "neighborhood", label: "Bairro", placeholder: "Bairro" },
                  { name: "city", label: "Cidade", placeholder: "Cidade" },
                  { name: "state", label: "Estado", placeholder: "SP, RJ..." },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as any}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} className="border-blue-950" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          placeholder="000.000.000-00"
                          customInput={Input}
                          {...field}
                          className="border-blue-950"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          placeholder="(11) 99999-9999"
                          customInput={Input}
                          {...field}
                          className="border-blue-950"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          placeholder="00000-000"
                          customInput={Input}
                          {...field}
                          className="border-blue-950"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto, bloco, etc. (opcional)"
                          {...field}
                          className="border-blue-950"
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
                {createShippingAddressMutation.isPending ||
                updateCartShippingAddressMutation.isPending
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
