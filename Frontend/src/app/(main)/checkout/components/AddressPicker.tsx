'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { District, Province, Ward } from '@/types';


interface SearchResult {
  type: 'province' | 'district' | 'ward';
  province: { name: string; code: number };
  district?: { name: string; code: number };
  ward?: { name: string; code: number };
}

interface AddressPickerProps {
  value: {
    province: string | null;
    district: string | null;
    ward: string | null;
  };
  onChange: (newValue: { province: string | null; district: string | null; ward: string | null; }) => void;
}

const API_HOST = "https://provinces.open-api.vn/api/v1/";

const AddressPicker: React.FC<AddressPickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'province' | 'district' | 'ward'>('province');
    
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State để lưu trữ dữ liệu tỉnh, quận, huyện và phường xã
    const [allProvinces, setAllProvinces] = useState<Province[]>([]);


    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    // const [allDataForSearch, setAllDataForSearch] = useState<Province[]>([]);

    const [loading, setLoading] = useState(true);
    const pickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);


  // --- Fetch Provinces ---
  useEffect(() => {
    const fetchAllData = async () => {
      // Không cần setLoading(true) vì đã đặt mặc định
      try {
        // Chỉ cần gọi 1 API duy nhất để lấy tất cả dữ liệu
        const response = await axios.get(`${API_HOST}?depth=3`,
          {
                    headers: {
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                }
        );
        console.log("Fetched all provinces and districts:", response.data);
        setAllProvinces(response.data || []);
      } catch (error) {
        console.error("Failed to fetch administrative data:", error);
        // Có thể thêm state để hiển thị lỗi cho người dùng
      } finally {
        setLoading(false); // Dừng loading sau khi tải xong (thành công hoặc thất bại)
      }
    };
    fetchAllData();
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần



  // --- Click outside handler ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSearching(false); // Thoát chế độ tìm kiếm khi click ra ngoài
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const searchResults = useMemo((): SearchResult[] => {
  //   if (!searchTerm) return [];
    
  //   const lowerCaseSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  //   const results: SearchResult[] = [];

  //   for (const province of allDataForSearch) {
  //     // Bây giờ province.districts là hợp lệ
  //     if (province.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)) {
  //       results.push({ type: 'province', province });
  //     }
  //     for (const district of province.districts) {
  //       // Bây giờ district.wards là hợp lệ
  //       if (district.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)) {
  //         results.push({ type: 'district', province, district });
  //       }
  //       for (const ward of district.wards) {
  //         if (ward.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)) {
  //           results.push({ type: 'ward', province, district, ward });
  //         }
  //       }
  //     }
  //   }
  //   return results.slice(0, 50); 
  // }, [searchTerm, allDataForSearch]);
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm) return [];
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const results: SearchResult[] = [];

    // Bây giờ tìm kiếm trên state `allProvinces`
    for (const province of allProvinces) {
      if (province.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)) {
        results.push({ type: 'province', province });
      }
      for (const district of province.districts) {
        if (district.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)) {
          results.push({ type: 'district', province, district });
        }
        for (const ward of district.wards) {
          if (ward.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)) {
            results.push({ type: 'ward', province, district, ward });
          }
        }
      }
    }
    return results.slice(0, 50); 
  }, [searchTerm, allProvinces]);


  const handleSelectResult = (result: SearchResult) => {
    onChange({
      province: result.province.name,
      district: result.district?.name || null,
      ward: result.ward?.name || null,
    });
    setIsOpen(false);
    setIsSearching(false);
    setSearchTerm('');
  };



  // --- Handlers for selecting items ---
  // const handleSelectProvince = async (province: Province) => {
  //   onChange({ province: province.name, district: null, ward: null });
  //   setActiveTab('district');
  //   setWards([]);
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(`${API_HOST}p/${province.code}?depth=2`);
  //     setDistricts(response.data.districts || []);
  //   } catch (error) {
  //     console.error("Failed to fetch districts:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSelectProvince = (province: Province) => {
    onChange({ province: province.name, district: null, ward: null });
    setActiveTab('district');
    setWards([]); // Xóa danh sách xã cũ

    // KHÔNG GỌI API NỮA! Lấy quận/huyện từ dữ liệu đã tải sẵn
    const selectedProvinceData = allProvinces.find(p => p.code === province.code);
    setDistricts(selectedProvinceData?.districts || []);
  };

  // const handleSelectDistrict = async (district: District) => {
  //   onChange({ ...value, district: district.name, ward: null });
  //   setActiveTab('ward');
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(`${API_HOST}d/${district.code}?depth=2`);
  //     setWards(response.data.wards || []);
  //   } catch (error) {
  //     console.error("Failed to fetch wards:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSelectDistrict = (district: District) => {
    onChange({ ...value, district: district.name, ward: null });
    setActiveTab('ward');
    
    // KHÔNG GỌI API NỮA!
    // Tìm tỉnh đang được chọn...
    const currentProvince = allProvinces.find(p => p.name === value.province);
    // ... rồi tìm quận/huyện trong tỉnh đó để lấy danh sách xã/phường
    const selectedDistrictData = currentProvince?.districts.find(d => d.code === district.code);
    setWards(selectedDistrictData?.wards || []);
  };

  const handleSelectWard = (ward: Ward) => {
    onChange({ ...value, ward: ward.name });
    setIsOpen(false); // Close dropdown after final selection
    setIsSearching(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

const startSearch = () => {
    setIsSearching(true);
    setSearchTerm(displayText); // Bắt đầu tìm kiếm với giá trị hiện tại
    // Focus vào input sau khi nó được render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopSearch = () => {
    setIsSearching(false);
    setSearchTerm('');
  };
  

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ province: null, district: null, ward: null });
    setDistricts([]);
    setWards([]);
    setActiveTab('province');
    if (isSearching) {
        setSearchTerm('');
        inputRef.current?.focus();
    }
  };

  const displayText = [value.province, value.district, value.ward].filter(Boolean).join(', ');

  return (
    <div className="relative" ref={pickerRef}>
      <label className="absolute z-50 -top-2 left-2 bg-white px-1 text-xs text-gray-500">
        Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
      </label>
      <div className="relative">
        {isSearching ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ để tìm kiếm..."
            className="w-full p-3 pr-10 border border-orange-500 text-black rounded-md bg-white ring-2 ring-orange-200"
          />
        ) : (
          <div 
            onClick={() => { setIsOpen(!isOpen); if (isOpen) setIsSearching(false); }} 
            onDoubleClick={startSearch} // Double click để bắt đầu tìm kiếm
            className="w-full p-3 pr-10 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between"
          >
            <span className={displayText ? 'text-gray-800' : 'text-gray-400'}>
              {displayText || 'Chọn địa chỉ'}
            </span>
          </div>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {displayText && (
              <button type="button" onClick={clearSelection} className="p-1 ..."><X size={14}/></button>
            )}
            <ChevronDown size={18} className={`... ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full bg-white border ...">
          {/* --- HIỂN THỊ CÓ ĐIỀU KIỆN: Giao diện Tab hoặc Giao diện Tìm kiếm --- */}
          {loading ? (
                <div className="flex items-center justify-center h-72">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="ml-2 text-gray-500">Đang tải dữ liệu địa chỉ...</span>
                </div>
            ) : (
                <>
                 {isSearching ? (
            // Giao diện tìm kiếm
            <div className="max-h-72 overflow-y-auto">
                <div className="p-2 border-b">
                    <button onClick={stopSearch} className="text-sm text-blue-500 hover:underline">Quay lại chọn theo danh sách</button>
                </div>
                {loading && <div className="p-4 ...">Đang tải dữ liệu tìm kiếm...</div>}
                {!loading && searchResults.length > 0 && <AddressList items={searchResults.map(r => ({ name: [r.ward?.name, r.district?.name, r.province.name].filter(Boolean).join(', '), code: r.ward?.code || r.district?.code || r.province.code }))} onSelect={handleSelectResult} data-full={searchResults} />}
                {!loading && searchResults.length === 0 && <div className="p-4 ...">Không tìm thấy kết quả.</div>}
            </div>
          ) : (
            // Giao diện Tab
            <>
              {/* <div className="flex border-b">
                <TabButton name="Tỉnh/Thành phố" isActive={activeTab === 'province'} onClick={() => setActiveTab('province')} />
                <TabButton name="Quận/Huyện" isActive={activeTab === 'district'} onClick={() => setActiveTab('district')} disabled={!value.province}/>
                <TabButton name="Phường/Xã" isActive={activeTab === 'ward'} onClick={() => setActiveTab('ward')} disabled={!value.district}/>
              </div>
              <div className="h-64 overflow-y-auto">
                {loading && <div className="p-4 ...">Đang tải...</div>}
                {!loading && activeTab === 'province' && <AddressList items={provinces} onSelect={handleSelectProvince} />}
                {!loading && activeTab === 'district' && <AddressList items={districts} onSelect={handleSelectDistrict} />}
                {!loading && activeTab === 'ward' && <AddressList items={wards} onSelect={handleSelectWard} />}
              </div> */}
              <div className="flex border-b">
                      <TabButton name="Tỉnh/Thành phố" isActive={activeTab === 'province'} onClick={() => setActiveTab('province')} />
                      <TabButton name="Quận/Huyện" isActive={activeTab === 'district'} onClick={() => setActiveTab('district')} disabled={!value.province}/>
                      <TabButton name="Phường/Xã" isActive={activeTab === 'ward'} onClick={() => setActiveTab('ward')} disabled={!value.district}/>
                    </div>
                    <div className="h-64 overflow-y-auto">
                      {/* Dùng allProvinces cho tab đầu tiên */}
                      {activeTab === 'province' && <AddressList items={allProvinces} onSelect={handleSelectProvince} />}
                      {activeTab === 'district' && <AddressList items={districts} onSelect={handleSelectDistrict} />}
                      {activeTab === 'ward' && <AddressList items={wards} onSelect={handleSelectWard} />}
                </div>
            </>
          )}
                </>
            )}
        </div>
      )}
    </div>
  );
};

// Sub-components
const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void; disabled?: boolean }> = ({ name, isActive, onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex-1 p-3 text-sm font-medium text-center ${
      isActive ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'
    } disabled:text-gray-300 disabled:cursor-not-allowed`}
  >
    {name}
  </button>
);
const AddressList: React.FC<{ items: { name: string; code: number }[]; onSelect: (item: any) => void; 'data-full'?: SearchResult[] }> = ({ items, onSelect, 'data-full': fullData }) => (
  <ul>
    {items.map((item, index) => (
      <li 
        key={item.code + '-' + index}
        onClick={() => onSelect(fullData ? fullData[index] : item)}
        className="p-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
      >
        {fullData ? (
          <>
            <span className="font-semibold">{fullData[index].ward?.name || fullData[index].district?.name || fullData[index].province.name}</span>
            <span className="text-gray-500 ml-2">
              { [fullData[index].district?.name, fullData[index].province.name].filter(n => n && n !== (fullData[index].ward?.name || fullData[index].district?.name || fullData[index].province.name)).join(', ') }
            </span>
          </>
        ) : (
          item.name
        )}
      </li>
    ))}
  </ul>
);

export default AddressPicker;