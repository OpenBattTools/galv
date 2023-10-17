import {CardProps} from "@mui/material";
import {
    CardActionBar,
    ExpandableCardProps,
    id_from_ref_props,
    PrettyObject
} from "../component_utils";
import useStyles from "../../UseStyles";
import {Cell, CellFamiliesApi, CellFamily, CellsApi, PatchedCell} from "../../api_codegen";
import {useQuery} from "@tanstack/react-query";
import Card from "@mui/material/Card";
import {Link} from "react-router-dom";
import clsx from "clsx";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import A from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import LoadingChip from "../LoadingChip";
import {ICONS} from "../../icons";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import Avatar from "@mui/material/Avatar";
import TeamChip from "../team/TeamChip";
import React, {useState} from "react";
import ErrorCard from "../error/ErrorCard";
import QueryWrapper, {QueryDependentElement} from "../QueryWrapper";
import {AxiosError, AxiosResponse} from "axios";
import CellFamilyChip from "./CellFamilyChip";
import {PATHS} from "../../App";
import Divider from "@mui/material/Divider";

export type AddProps<T> = T & {[key: string]: any}

export default function CellCard(props: ExpandableCardProps & CardProps) {
    // No nice way to do this automatically because TS is compile-time and the OpenAPI spec lists all fields in Patched* anyway
    const read_only_fields: (keyof Cell)[] = ['url', 'uuid', 'family', 'cycler_tests', 'permissions', 'in_use', 'team']

    const { classes } = useStyles();
    const [editing, _setEditing] = useState<boolean>(props.editing || true)
    const [expanded, setExpanded] = useState<boolean>(props.expanded || editing)
    const [editableData, _setEditableData] =
        useState<Partial<AddProps<PatchedCell>>>({})
    const [editableDataHistory, setEditableDataHistory] = useState<Partial<AddProps<PatchedCell>>[]>([])
    const [editableDataHistoryIndex, setEditableDataHistoryIndex] = useState<number>(0)
    const [readOnlyData, _setReadOnlyData] = useState<Partial<AddProps<Cell>>>({})

    const setEditing = (e: boolean) => {
        _setEditing(e)
        if (e) setExpanded(e)
    }

    const splitData = (props: AddProps<Cell>) => {
        const read_only_data: Partial<Cell> = {}
        const write_data: Partial<AddProps<PatchedCell>> = {}
        for (const k of Object.keys(props)) {
            if (read_only_fields.includes(k as keyof Cell)) {
                read_only_data[k as keyof Cell] = props[k]
            } else {
                write_data[k] = props[k]
            }
        }
        _setEditableData(write_data)
        setEditableDataHistory([write_data])
        _setReadOnlyData(read_only_data)
        _setCellData(props)
    }

    const setEditableData = (d: Partial<AddProps<PatchedCell>>) => {
        _setEditableData(d)
        setEditableDataHistoryIndex(editableDataHistoryIndex + 1)
        setEditableDataHistory([
            ...editableDataHistory.slice(0, editableDataHistoryIndex + 1),
            d
        ])
    }
    const undoEditableData = () => {
        if (editableDataHistoryIndex > 0) {
            const index = editableDataHistoryIndex - 1
            _setEditableData(editableDataHistory[index])
            setEditableDataHistoryIndex(index)
        }
    }
    const redoEditableData = () => {
        if (editableDataHistoryIndex < editableDataHistory.length - 1) {
            const index = editableDataHistoryIndex + 1
            _setEditableData(editableDataHistory[index])
            setEditableDataHistoryIndex(index)
        }
    }
    const [cell_data, _setCellData] = useState<AddProps<Cell>>()
    const [family_data, setFamilyData] = useState<AddProps<CellFamily>>()

    const cell_uuid = id_from_ref_props<string>(props)
    const api_handler = new CellsApi()
    const family_api_handler = new CellFamiliesApi()
    const cell_query = useQuery<AxiosResponse<AddProps<Cell>>, AxiosError>({
        queryKey: ['cell_retrieve', cell_uuid],
        queryFn: () => api_handler.cellsRetrieve(cell_uuid).then((r) => {
            if (r === undefined) return Promise.reject("No data in response")
            splitData(r.data)
            return r
        })
    })
    const family_query = useQuery<AxiosResponse<AddProps<CellFamily>>, AxiosError>({
        queryKey: ['cell_family_retrieve', cell_data?.family],
        queryFn: () => family_api_handler
            .cellFamiliesRetrieve(id_from_ref_props<string>(cell_query.data!.data.family))
            .then((r) => {
                if (r === undefined) return Promise.reject("No data in response")
                setFamilyData(r.data)
                return r
            }),
        enabled: !!cell_data?.family
    })

    const action = <CardActionBar
        type="cell"
        uuid={cell_uuid}
        path={PATHS.CELLS}
        family_uuid={cell_data?.family!}
        cycler_test_count={cell_data?.cycler_tests.length}
        editable={cell_data?.permissions.write!}
        editing={editing}
        setEditing={setEditing}
        onUndo={undoEditableData}
        onRedo={redoEditableData}
        undoable={editableDataHistoryIndex > 0}
        redoable={editableDataHistoryIndex < editableDataHistory.length - 1}
        onEditSave={() => {
            _setCellData({...cell_data!, ...editableData})
            return true
        }}
        onEditDiscard={() => {
            _setEditableData({...editableData, ...editableDataHistory[0]})
            setEditableDataHistory([editableDataHistory[0]])
            setEditableDataHistoryIndex(0)
            return true
        }}
        expanded={expanded}
        setExpanded={setExpanded}
    />

    const loadingBody = <Card key={cell_uuid} className={clsx(classes.item_card)} {...props as CardProps}>
        <CardHeader
            avatar={<CircularProgress sx={{color: (t) => t.palette.text.disabled}}/>}
            title={<A component={Link} to={`${PATHS.CELLS}/${cell_uuid}`}>{cell_uuid}</A>}
            subheader={<Stack direction="row" spacing={1}>
                <A component={Link} to={PATHS.CELLS}>Cell</A>
                <LoadingChip icon={<ICONS.TEAMS/>} />
            </Stack>}
            action={action}
        />
        {expanded? <CardContent>
            <Grid container>
                <LoadingChip icon={<ICONS.FAMILY/>}/>
            </Grid>
            <Grid container>
                <LoadingChip icon={<ICONS.CYCLER_TESTS/>}/>
            </Grid>
        </CardContent> : <CardContent />}
    </Card>

    const cardBody = <Card key={cell_uuid} className={clsx(classes.item_card)} {...props as CardProps}>
        <CardHeader
            avatar={<Avatar variant="square"><ICONS.CELLS/></Avatar>}
            title={<A component={Link} to={`${PATHS.CELLS}/${cell_uuid}`}>
                {`${family_data?.manufacturer} ${family_data?.model} ${cell_data?.identifier}`}
            </A>}
            subheader={<Stack direction="row" spacing={1} alignItems="center">
                <A component={Link} to={PATHS.CELLS}>Cell</A>
                <TeamChip url={cell_data?.team!} sx={{fontSize: "smaller"}}/>
            </Stack>}
            action={action}
        />
        {expanded? <CardContent>
            <Stack spacing={1}>
                <Divider key="read-props-header">Read-only properties</Divider>
                {cell_data && <PrettyObject
                    key="read-props"
                    object={readOnlyData}
                />}
                <Divider key="write-props-header">Editable properties</Divider>
                {cell_data && <PrettyObject
                    key="write-props"
                    object={editableData}
                    edit_mode={editing}
                    type_locked_keys={['identifier']}
                    onEdit={setEditableData}
                />}
                {family_data?.uuid && <Divider key="family-props-header">
                    Inherited from <CellFamilyChip uuid={family_data?.uuid}/>
                </Divider>}
                {family_data && <PrettyObject
                    object={family_data}
                    exclude_keys={[...Object.keys(cell_data!), 'cells']}
                />}
            </Stack>
        </CardContent> : <CardContent />}
    </Card>

    const getErrorBody: QueryDependentElement = (queries) => <ErrorCard
        status={queries.find(q => q.isError)?.error?.response?.status}
        header={
            <CardHeader
                avatar={<Avatar variant="square"><ICONS.CELLS/></Avatar>}
                title={cell_uuid}
                subheader={<Stack direction="row" spacing={1} alignItems="center">
                    <A component={Link} to={PATHS.CELLS}>Cell</A>
                </Stack>}
            />
        }
    />

    return <QueryWrapper
        queries={[cell_query, family_query]}
        loading={loadingBody}
        error={getErrorBody}
        success={cardBody}
    />
}