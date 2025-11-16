import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteShippingAddress } from "@/actions/shipping/delete-shipping-address";
import { getUserAddressesQueryKey } from "../queries/use-user-addresses";

export const getDeleteShippingAddressMutationKey = () =>
  ["delete-shipping-address"] as const;

export const useDeleteShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getDeleteShippingAddressMutationKey(),

    mutationFn: (shippingAddressId: string) =>
      deleteShippingAddress(shippingAddressId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserAddressesQueryKey(),
      });
    },
  });
};
