// components/dashboard/BlockReorder.tsx
'use client';

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

interface SortableItemProps {
    id: string;
    label: string;
}

function SortableItem({ id, label }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 transition-colors ${isDragging ? 'border-primary bg-slate-900 shadow-xl' : 'hover:border-slate-700'
                }`}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing"
            >
                <GripVertical size={20} />
            </button>
            <div className="flex-1">
                <p className="text-sm font-semibold capitalize text-slate-200">{label}</p>
            </div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Block
            </div>
        </div>
    );
}

export default function BlockReorder({
    podcastId,
    initialLayout
}: {
    podcastId: string,
    initialLayout: string[]
}) {
    const [items, setItems] = useState(initialLayout);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newLayout = arrayMove(items, oldIndex, newIndex);
                saveLayout(newLayout);
                return newLayout;
            });
        }
    }

    async function saveLayout(newLayout: string[]) {
        setIsSaving(true);
        const { error } = await supabase
            .from('podcasts')
            .update({ page_layout: newLayout })
            .eq('id', podcastId);

        if (error) {
            console.error('Error saving layout:', error);
        }
        setIsSaving(false);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-200">Page Structure</h3>
                {isSaving && <span className="text-xs text-primary animate-pulse">Saving...</span>}
            </div>
            <p className="text-sm text-slate-400">Drag to reorder how sections appear on your homepage.</p>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {items.map((id) => (
                            <SortableItem key={id} id={id} label={id} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
