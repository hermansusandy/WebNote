import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, FlatList } from 'react-native';
import { Filter, ChevronDown, Check } from 'lucide-react-native';

interface FilterRowProps {
    categories: any[];
    subCategories: any[];
    selectedCategory: string;
    selectedSubCategory: string;
    onSelectCategory: (category: string) => void;
    onSelectSubCategory: (subCategory: string) => void;
}

export function FilterRow({
    categories,
    subCategories,
    selectedCategory,
    selectedSubCategory,
    onSelectCategory,
    onSelectSubCategory
}: FilterRowProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'category' | 'subCategory'>('category');

    const openModal = (type: 'category' | 'subCategory') => {
        setModalType(type);
        setModalVisible(true);
    };

    const renderModalItem = ({ item }: { item: any }) => {
        const isSelected = modalType === 'category'
            ? selectedCategory === item.name
            : selectedSubCategory === item.name;

        return (
            <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50"
                onPress={() => {
                    if (modalType === 'category') onSelectCategory(item.name);
                    else onSelectSubCategory(item.name);
                    setModalVisible(false);
                }}
            >
                <Text className={`text-base ${isSelected ? 'text-purple-600 font-semibold' : 'text-slate-700'}`}>
                    {item.name}
                </Text>
                {isSelected && <Check size={18} color="#9333ea" />}
            </TouchableOpacity>
        );
    };

    const data = modalType === 'category'
        ? [{ id: 'all', name: 'All Categories' }, ...categories]
        : [{ id: 'all', name: 'All Sub-Categories' }, ...subCategories];

    return (
        <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <TouchableOpacity
                    className={`flex-row items-center border rounded-lg px-3 py-2 mr-3 ${selectedCategory !== 'All Categories' ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200'}`}
                    onPress={() => openModal('category')}
                >
                    <Filter color={selectedCategory !== 'All Categories' ? "#9333ea" : "#64748b"} size={16} />
                    <Text className={`ml-2 font-medium ${selectedCategory !== 'All Categories' ? 'text-purple-700' : 'text-slate-600'}`}>
                        {selectedCategory}
                    </Text>
                    <ChevronDown color={selectedCategory !== 'All Categories' ? "#9333ea" : "#cbd5e1"} size={16} style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    className={`flex-row items-center border rounded-lg px-3 py-2 mr-3 ${selectedSubCategory !== 'All Sub-Categories' ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200'}`}
                    onPress={() => openModal('subCategory')}
                >
                    <Filter color={selectedSubCategory !== 'All Sub-Categories' ? "#9333ea" : "#64748b"} size={16} />
                    <Text className={`ml-2 font-medium ${selectedSubCategory !== 'All Sub-Categories' ? 'text-purple-700' : 'text-slate-600'}`}>
                        {selectedSubCategory}
                    </Text>
                    <ChevronDown color={selectedSubCategory !== 'All Sub-Categories' ? "#9333ea" : "#cbd5e1"} size={16} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setModalVisible(false)}>
                    <View className="bg-white rounded-t-3xl h-[50%]">
                        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-slate-900">
                                Select {modalType === 'category' ? 'Category' : 'Sub-Category'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-purple-600 font-medium">Close</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={data}
                            renderItem={renderModalItem}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}
