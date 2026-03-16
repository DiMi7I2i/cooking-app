<template>
    <div class="card">
        <DataView :value="products" paginator :rows="5">
            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-12">
                        <div class="flex flex-col sm:flex-row sm:items-center p-4 gap-3" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                            <div class="md:w-[10rem] relative">
                                <img class="block xl:block mx-auto rounded-md w-full" :src="`https://primefaces.org/cdn/primevue/images/product/${item.image}`" :alt="item.name" />
                                <Tag :value="item.inventoryStatus" :severity="getSeverity(item)" class="absolute" style="left: 4px; top: 4px"></Tag>
                            </div>
                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-4">
                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                    <div>
                                        <span class="font-medium text-secondary text-sm">{{ item.category }}</span>
                                        <div class="text-lg font-medium text-surface-700 dark:text-surface-0/80 mt-2">{{ item.name }}</div>
                                    </div>
                                    <div class="bg-surface-100 dark:bg-surface-700 p-1" style="border-radius: 30px">
                                        <div class="bg-surface-0 dark:bg-surface-900 flex items-center gap-2 justify-center py-1 px-2" style="border-radius: 30px; shadow-md: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                            <span class="text-surface-700 dark:text-surface-0/80 font-medium text-sm">{{ item.rating }}</span>
                                            <i class="pi pi-star-fill text-yellow-500"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col md:items-end gap-5">
                                    <span class="text-xl font-semibold text-surface-700 dark:text-surface-0/80">${{ item.price }}</span>
                                    <div class="flex flex-row-reverse md:flex-row gap-2">
                                        <Button icon="pi pi-heart" outlined></Button>
                                        <Button icon="pi pi-shopping-cart" label="Buy Now" :disabled="item.inventoryStatus === 'OUTOFSTOCK'" class="flex-auto md:flex-initial white-space-nowrap"></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// @ts-expect-error - ProductService is a JS module without type declarations
import { ProductService } from '@/service/ProductService';

interface Product {
    inventoryStatus: string;
    [key: string]: unknown;
}

onMounted(() => {
    ProductService.getProductsSmall().then((data: Product[]) => (products.value = data.slice(0, 5)));
});

const products = ref<Product[]>();
const getSeverity = (product: Product) => {
    switch (product.inventoryStatus) {
        case 'INSTOCK':
            return 'success';

        case 'LOWSTOCK':
            return 'warn';

        case 'OUTOFSTOCK':
            return 'danger';

        default:
            return undefined;
    }
};
</script>

