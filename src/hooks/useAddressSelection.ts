import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";

interface Province {
    code: number;
    name: string;
}

interface District {
    code: number;
    name: string;
}

interface Ward {
    code: number;
    name: string;
}

export const useAddressSelection = (form: UseFormReturn<any>) => {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    const selectedProvince = form.watch("province");
    const selectedDistrict = form.watch("district");
    const selectedWard = form.watch("ward");

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoadingProvinces(true);
                const response = await fetch("https://provinces.open-api.vn/api/");
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                toast.error("Không thể tải danh sách tỉnh/thành");
            } finally {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    setLoadingDistricts(true);
                    const response = await fetch(
                        `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
                    );
                    const data = await response.json();
                    setDistricts(data.districts || []);
                    form.setValue("district", "");
                    form.setValue("ward", "");
                    setWards([]);
                } catch (error) {
                    toast.error("Không thể tải danh sách quận/huyện");
                } finally {
                    setLoadingDistricts(false);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setWards([]);
            form.setValue("district", "");
            form.setValue("ward", "");
        }
    }, [selectedProvince, form]);

    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    setLoadingWards(true);
                    const response = await fetch(
                        `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
                    );
                    const data = await response.json();
                    setWards(data.wards || []);
                    form.setValue("ward", "");
                } catch (error) {
                    toast.error("Không thể tải danh sách phường/xã");
                } finally {
                    setLoadingWards(false);
                }
            };
            fetchWards();
        } else {
            setWards([]);
            form.setValue("ward", "");
        }
    }, [selectedDistrict, form]);

    const selectedProvinceName = provinces.find(p => p.code.toString() === selectedProvince)?.name || "";
    const selectedDistrictName = districts.find(d => d.code.toString() === selectedDistrict)?.name || "";
    const selectedWardName = wards.find(w => w.code.toString() === selectedWard)?.name || "";

    return {
        provinces,
        districts,
        wards,
        loadingProvinces,
        loadingDistricts,
        loadingWards,
        selectedProvinceName,
        selectedDistrictName,
        selectedWardName,
    };
};
