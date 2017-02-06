module.exports = function (layer, skipName) {
    let errors = [];

    if (!layer) {
        errors.push('Layer 不能为空');
    } else {
        if (!(typeof layer === 'object')) {
            errors.push('Layer 的类型是 object, 不能是 ' + (typeof layer));
        } else {
            if (!layer.name && !skipName) {
                errors.push('Layer 名称不能为空');
            } else {
                if (!(typeof layer.name === 'string')) {
                    errors.push('Layer 名称应该是字符');
                }
            }

            if (!layer.schema) {
                errors.push('Layer schema 不能为空');
            } else {
                if (!(typeof layer.schema === 'object')) {
                    errors.push('Layer schema 的类型是 object, 不应该是 ' + (typeof layer.schema));
                } else {
                    if (!layer.schema.resources || layer.schema.resources.length == 0) {
                        errors.push('Layer 至少包含一个 Resource');
                    }

                    let resourcesHolder = {};
                    layer.schema.resources.map((resource) => {
                        resourcesHolder[resource.id] = {resource: resource, foundJoin: false};
                    });

                    let joins = layer.schema.joins || [];

                    joins.map(join => {
                        if (!join.on || join.on.length == 0) {
                            let sourceResource = resourcesHolder[join.sourceResourceId].resource;
                            let targetResource = resourcesHolder[join.targetResourceId].resource;
                            errors.push((sourceResource.title || sourceResource.name) + ' 与 ' + (targetResource.title || targetResource.name) + ' 未设置关联字段');
                        }

                        (join.on || []).map(on => {
                            if (!on.sourceColumnName || !on.targetColumnName) {
                                let sourceResource = resourcesHolder[join.sourceResourceId].resource;
                                let targetResource = resourcesHolder[join.targetResourceId].resource;
                                errors.push((sourceResource.title || sourceResource.name) + ' 与 ' + (targetResource.title || targetResource.name) + ' 一个 on 条件没有设置完善');
                            }
                        })
                    });

                    if (layer.schema.resources && layer.schema.resources.length >= 2) {
                        let joins = layer.schema.joins || [];
                        joins.map(join => {
                            resourcesHolder[join.sourceResourceId].foundJoin = true;
                            resourcesHolder[join.targetResourceId].foundJoin = true;
                        });

                        Object.keys(resourcesHolder).map(id => {
                            if (!resourcesHolder[id].foundJoin) {
                                let resource = resourcesHolder[id].resource;
                                errors.push((resource.title || resource.name) + ' 没有配置关联，请检查');
                            }
                        })
                    }
                }
            }
        }
    }
    return errors;
};
