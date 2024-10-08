import { computed, ref } from '@mpxjs/core';

class PageData {
    private pageSize = ref(20);
    private page = ref(1);

    private total = ref(0);
    public setTotal(total: number) {
        this.total.value = total;
    }

    public list = ref<any[]>([]);

    // 刷新数据
    public refresh() {
        this.page.value = 1;
        this.list.value = [];
        this.total.value = 0;
    }

    public get unrefData() {
        return {
            page: this.page.value,
            pageSize: this.pageSize.value,
            total: this.total.value,
            list: this.list.value,
        };
    }

    public get pageArgs() {
        return {
            page: this.page.value,
            pageSize: this.pageSize.value,
        };
    }

    public hasMore = computed(() => {
        return this.list.value.length < this.total.value;
    });

    public isLoading = ref(false);

    public get isReady() {
        return !this.isLoading.value;
    }

    public prepare() {
        if (this.isLoading.value) return false;
        this.isLoading.value = true;
        return true;
    }

    public next(newList: any[], total: number) {
        this.isLoading.value = false;
        if (newList.length === 0) {
            console.warn('no more data');
            return;
        }

        this.setTotal(total);
        this.page.value++;
        this.list.value = this.list.value.concat(newList);
    }
}

export default PageData;
