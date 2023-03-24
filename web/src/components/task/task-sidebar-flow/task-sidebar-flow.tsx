import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button, FlexRow, Panel, TabButton } from '@epam/loveship';
import { useTaskAnnotatorContext } from 'connectors/task-annotator-connector/task-annotator-context';
import { AnnotationList } from './annotation-list';
import { Annotation } from 'shared';
import { getSortedAllAnnotationList, getSortedAnnotationsByUserId, getTabs } from './utils';
import { OWNER_TAB, VISIBILITY_SETTING_ID } from './constants';
import { ReactComponent as closeIcon } from '@epam/assets/icons/common/navigation-chevron-left_left-18.svg';
import { ReactComponent as openIcon } from '@epam/assets/icons/common/navigation-chevron-right_right-18.svg';

import styles from './styles.module.scss';

export const FlowSideBar: FC = () => {
    const [currentTab, setCurrentTab] = useState(OWNER_TAB.id);
    const [isHidden, setIsHidden] = useState<boolean>(() => {
        const savedValue = localStorage.getItem(VISIBILITY_SETTING_ID);
        return savedValue ? JSON.parse(savedValue) : false;
    });

    const {
        taskUsers,
        annotationsByUserId,
        setSelectedAnnotation,
        setCurrentDocumentUserId,
        currentDocumentUserId = OWNER_TAB.id,
        allAnnotations: allAnnotationsByPageNum = {},
        selectedAnnotation: { id: selectedAnnotationId } = {}
    } = useTaskAnnotatorContext();

    useEffect(() => {
        setCurrentTab(currentDocumentUserId);
    }, [currentDocumentUserId]);

    const handleChangeTab = (tab: string) => {
        setCurrentTab(tab);
        setCurrentDocumentUserId(tab === OWNER_TAB.id ? undefined : tab);
    };

    const handleToggleVisibility = () => {
        localStorage.setItem(VISIBILITY_SETTING_ID, String(!isHidden));
        setIsHidden(!isHidden);
    };

    const tabs = useMemo(
        () => getTabs(taskUsers.current.annotators, Object.keys(annotationsByUserId)),
        [taskUsers.current.annotators, annotationsByUserId]
    );

    const allSortedAnnotations = useMemo(
        () => getSortedAllAnnotationList(allAnnotationsByPageNum),
        [allAnnotationsByPageNum]
    );

    const sortedAnnotationsByUserId = useMemo(
        () => getSortedAnnotationsByUserId(annotationsByUserId),
        [annotationsByUserId]
    );

    const annotationsByTab: Record<string, Annotation[]> = {
        ...sortedAnnotationsByUserId,
        [OWNER_TAB.id]: allSortedAnnotations
    };

    return (
        <Panel cx={styles.wrapper}>
            <Button
                fill="none"
                cx={styles.hideIcon}
                onClick={handleToggleVisibility}
                icon={isHidden ? openIcon : closeIcon}
            />
            {!isHidden && (
                <Panel background="white" cx={styles.container}>
                    {tabs.length > 1 && (
                        <FlexRow>
                            {tabs.map(({ id, caption }) => (
                                <TabButton
                                    key={id}
                                    size="36"
                                    cx={styles.tab}
                                    caption={caption}
                                    isLinkActive={currentTab === id}
                                    onClick={() => handleChangeTab(id)}
                                />
                            ))}
                        </FlexRow>
                    )}
                    <AnnotationList
                        onSelect={setSelectedAnnotation}
                        list={annotationsByTab[currentTab]}
                        selectedAnnotationId={selectedAnnotationId}
                    />
                </Panel>
            )}
        </Panel>
    );
};